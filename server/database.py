from sqlmodel import SQLModel, create_engine, Session, select
from models import ParkingSpot

engine = create_engine(
    "sqlite:///./parking.db",
    connect_args={"check_same_thread": False},
    echo=False,
)


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