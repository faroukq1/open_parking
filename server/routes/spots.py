from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func

from database import get_session
from models import ParkingSpot, SpotRead

router = APIRouter(prefix="/spots", tags=["Spots"])


@router.get("/", response_model=list[SpotRead])
def get_all_spots(session: Session = Depends(get_session)):
    return session.exec(select(ParkingSpot)).all()


@router.get("/available-count")
def get_available_count(session: Session = Depends(get_session)):
    total     = session.exec(select(func.count(ParkingSpot.id))).one()
    available = session.exec(select(func.count(ParkingSpot.id)).where(ParkingSpot.is_available == True)).one()
    return {
        "available": available,
        "total": total,
    }