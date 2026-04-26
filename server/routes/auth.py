from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
import bcrypt

from database import get_session
from models import User, UserCreate, UserReadWithVehicles, Vehicle, LoginRequest

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserReadWithVehicles)
def register(data: UserCreate, session: Session = Depends(get_session)):
    email = data.email.strip().lower()

    if not data.plate_numbers:
        raise HTTPException(400, "At least one plate number is required")

    # 1. Check email not already used
    exists = session.exec(select(User).where(User.email == email)).first()
    if exists:
        raise HTTPException(400, "Email already registered")

    # 2. Check no duplicate plates
    normalized_plates = []
    for plate in data.plate_numbers:
        normalized_plate = plate.strip().upper()
        if not normalized_plate:
            raise HTTPException(400, "Plate number cannot be empty")
        normalized_plates.append(normalized_plate)

        taken = session.exec(
            select(Vehicle).where(Vehicle.plate_number == normalized_plate)
        ).first()
        if taken:
            raise HTTPException(400, f"Plate {normalized_plate} already registered")

    # 3. Create user
    password_bytes = data.password.encode('utf-8')[:72]
    hashed_password = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')

    user = User(
        full_name=data.full_name,
        email=email,
        phone=data.phone,
        hashed_password=hashed_password,
        user_type=data.user_type,
        room_number=data.room_number,
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    # 4. Create vehicles
    vehicles = []
    for plate in normalized_plates:
        vehicle = Vehicle(user_id=user.id, plate_number=plate)
        session.add(vehicle)
        vehicles.append(vehicle)
    session.commit()
    for v in vehicles:
        session.refresh(v)

    return UserReadWithVehicles(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        user_type=user.user_type,
        room_number=user.room_number,
        created_at=user.created_at,
        vehicles=vehicles,
        is_enter=user.is_enter,
    )


@router.post("/login", response_model=UserReadWithVehicles)
def login(data: LoginRequest, session: Session = Depends(get_session)):
    normalized_email = data.email.strip().lower()

    # 1. Find user by email
    user = session.exec(select(User).where(User.email == normalized_email)).first()
    if not user:
        raise HTTPException(401, "Invalid email or password")

    # 2. Verify password
    password_bytes = data.password.encode('utf-8')[:72]
    hashed_bytes = user.hashed_password.encode('utf-8')
    if not bcrypt.checkpw(password_bytes, hashed_bytes):
        raise HTTPException(401, "Invalid email or password")

    # 3. Fetch vehicles
    vehicles = session.exec(select(Vehicle).where(Vehicle.user_id == user.id)).all()

    return UserReadWithVehicles(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        user_type=user.user_type,
        room_number=user.room_number,
        created_at=user.created_at,
        vehicles=list(vehicles),
        is_enter=user.is_enter,
    )