from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from database import get_session
from models import User, Vehicle
from pydantic import BaseModel
from typing import Optional
import bcrypt

router = APIRouter(prefix="/users", tags=["users"])


# ── Request schemas ──────────────────────────────────────────
class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    email:     Optional[str] = None
    phone:     Optional[str] = None


class UpdatePasswordRequest(BaseModel):
    current_password: str
    new_password:     str


class UpdateLicensePlateRequest(BaseModel):
    vehicle_id: Optional[int] = None  # If updating existing
    plate_number: str


class UpdatePushTokenRequest(BaseModel):
    expo_push_token: str


# ── GET /users/{user_id} ─────────────────────────────────────
@router.get("/{user_id}")
def get_user(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id":         user.id,
        "full_name":  user.full_name,
        "email":      user.email,
        "phone":      user.phone,
        "user_type":  user.user_type,
        "created_at": user.created_at,
    }


# ── PATCH /users/{user_id} ───────────────────────────────────
@router.patch("/{user_id}")
def update_profile(
    user_id: int,
    body: UpdateProfileRequest,
    session: Session = Depends(get_session),
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if body.email and body.email != user.email:
        existing = session.exec(select(User).where(User.email == body.email)).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = body.email

    if body.full_name:
        user.full_name = body.full_name
    if body.phone:
        user.phone = body.phone

    session.add(user)
    session.commit()
    session.refresh(user)

    return {
        "id":        user.id,
        "full_name": user.full_name,
        "email":     user.email,
        "phone":     user.phone,
        "user_type": user.user_type,
    }


# ── PATCH /users/{user_id}/password ─────────────────────────
@router.patch("/{user_id}/password")
def update_password(
    user_id: int,
    body: UpdatePasswordRequest,
    session: Session = Depends(get_session),
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not bcrypt.checkpw(
        body.current_password.encode()[:72],
        user.hashed_password.encode()
    ):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    user.hashed_password = bcrypt.hashpw(
        body.new_password.encode()[:72],
        bcrypt.gensalt()
    ).decode()

    session.add(user)
    session.commit()

    return {"message": "Password updated successfully"}


# ── DELETE /users/{user_id} ──────────────────────────────────
@router.delete("/{user_id}")
def delete_account(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    session.delete(user)
    session.commit()
    return {"message": "Account deleted"}


# ── POST/PATCH /users/{user_id}/vehicle ──────────────────────
@router.post("/{user_id}/vehicle")
def add_vehicle(
    user_id: int,
    body: UpdateLicensePlateRequest,
    session: Session = Depends(get_session),
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    normalized_plate = body.plate_number.strip().upper()
    if not normalized_plate:
        raise HTTPException(status_code=400, detail="License plate cannot be empty")

    # Check if plate already exists
    existing_plate = session.exec(
        select(Vehicle).where(Vehicle.plate_number == normalized_plate)
    ).first()
    if existing_plate and (not body.vehicle_id or existing_plate.id != body.vehicle_id):
        raise HTTPException(status_code=400, detail="License plate already in use")

    # Update existing vehicle or create new one
    if body.vehicle_id:
        vehicle = session.get(Vehicle, body.vehicle_id)
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        if vehicle.user_id != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized")
        vehicle.plate_number = normalized_plate
    else:
        vehicle = Vehicle(user_id=user_id, plate_number=normalized_plate)

    session.add(vehicle)
    session.commit()
    session.refresh(vehicle)

    return {
        "id": vehicle.id,
        "user_id": vehicle.user_id,
        "plate_number": vehicle.plate_number,
        "created_at": vehicle.created_at,
    }


# ── PATCH /users/{user_id}/push-token ───────────────────────
@router.patch("/{user_id}/push-token")
def update_push_token(
    user_id: int,
    body: UpdatePushTokenRequest,
    session: Session = Depends(get_session),
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.expo_push_token = body.expo_push_token
    session.add(user)
    session.commit()
    return {"message": "Push token saved"}


# ── GET /users/{user_id}/pending-entry ──────────────────────
@router.get("/{user_id}/pending-entry")
def get_pending_entry(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"pending": user.pending_entry}


# ── POST /users/{user_id}/clear-pending ─────────────────────
@router.post("/{user_id}/clear-pending")
def clear_pending_entry(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.pending_entry = False
    session.add(user)
    session.commit()
    return {"message": "Pending entry cleared"}