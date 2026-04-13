import os
from pathlib import Path

from sqlmodel import SQLModel, create_engine, Session, select
from models import ParkingSpot

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_SQLITE_PATH = BASE_DIR / "parking.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_SQLITE_PATH}")

engine_kwargs = {"echo": False}
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_kwargs)


def create_tables():
    SQLModel.metadata.create_all(engine)


def seed_spots():
    """Create 20 parking spots if they don't exist yet."""
    with Session(engine) as session:
        existing = session.exec(select(ParkingSpot)).first()
        if not existing:
            for i in range(1, 21):
                session.add(ParkingSpot(spot_number=i))
            session.commit()


def get_session():
    with Session(engine) as session:
        yield session