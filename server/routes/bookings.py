from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from datetime import datetime

from database import get_session
from models import (
    Booking, BookingCreate, BookingRead,
    BookingStatus, ParkingSpot, Vehicle, User,
)

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.get("/active/{user_id}")
def get_active_booking(user_id: int, session: Session = Depends(get_session)):
    booking = session.exec(
        select(Booking).where(
            Booking.user_id == user_id,
            Booking.status.in_([BookingStatus.reserved, BookingStatus.active]),
        )
    ).first()

    if not booking:
        return {"active": False}

    spot    = session.get(ParkingSpot, booking.spot_id)
    vehicle = session.get(Vehicle, booking.vehicle_id)

    return {
        "active":       True,
        "booking_id":   booking.id,
        "status":       booking.status,
        "spot_number":  spot.spot_number if spot else None,
        "plate_number": vehicle.plate_number if vehicle else None,
        "entered_at":   booking.entered_at,
        "reserved_at":  booking.reserved_at,
    }


@router.get("/history/{user_id}")
def get_booking_history(
    user_id: int,
    limit: int = Query(default=10, ge=1, le=100),
    session: Session = Depends(get_session),
):
    bookings = session.exec(
        select(Booking)
        .where(Booking.user_id == user_id)
        .order_by(Booking.reserved_at.desc())
        .limit(limit)
    ).all()

    history = []
    for b in bookings:
        spot    = session.get(ParkingSpot, b.spot_id)
        vehicle = session.get(Vehicle, b.vehicle_id)
        history.append({
            "booking_id":   b.id,
            "status":       b.status.value,
            "spot_number":  spot.spot_number if spot else None,
            "plate_number": vehicle.plate_number if vehicle else None,
            "reserved_at":  b.reserved_at,
            "entered_at":   b.entered_at,
            "exited_at":    b.exited_at,
        })

    return history


@router.post("/{user_id}", response_model=BookingRead)
def create_booking(user_id: int, data: BookingCreate, session: Session = Depends(get_session)):
    # Require plate scan approval before allowing a booking
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    if not user.is_enter:
        raise HTTPException(403, "Plate scan required before booking")

    spot = session.get(ParkingSpot, data.spot_id)
    if not spot or not spot.is_available:
        raise HTTPException(400, "Spot not available")

    vehicle = session.get(Vehicle, data.vehicle_id)
    if not vehicle or vehicle.user_id != user_id:
        raise HTTPException(404, "Vehicle not found")

    # Block if user already has an active booking
    active = session.exec(
        select(Booking).where(
            Booking.user_id == user_id,
            Booking.status.in_([BookingStatus.reserved, BookingStatus.active]),
        )
    ).first()
    if active:
        raise HTTPException(400, "You already have an active booking")

    spot.is_available = False
    booking = Booking(user_id=user_id, vehicle_id=data.vehicle_id, spot_id=data.spot_id)
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return booking


@router.delete("/{booking_id}")
def cancel_booking(booking_id: int, session: Session = Depends(get_session)):
    booking = session.get(Booking, booking_id)
    if not booking:
        raise HTTPException(404, "Booking not found")
    if booking.status == BookingStatus.active:
        raise HTTPException(400, "Cannot cancel — car is already inside")

    spot = session.get(ParkingSpot, booking.spot_id)
    if spot:
        spot.is_available = True

    booking.status = BookingStatus.cancelled
    session.commit()
    return {"message": "Booking cancelled"}