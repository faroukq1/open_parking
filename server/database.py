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


def run_migrations():
    """Apply schema migrations that SQLModel create_all won't handle (new columns)."""
    from sqlalchemy import text
    with engine.connect() as conn:
        for column, definition in [
            ("is_enter", "INTEGER NOT NULL DEFAULT 0"),
        ]:
            try:
                conn.execute(text(f"ALTER TABLE user ADD COLUMN {column} {definition}"))
                conn.commit()
            except Exception:
                pass  # column already exists


def seed_spots():
    """Ensure all 182 parking spots exist in the database."""
    with Session(engine) as session:
        existing = {s.spot_number for s in session.exec(select(ParkingSpot)).all()}
        missing = [i for i in range(1, 183) if i not in existing]
        if missing:
            for i in missing:
                session.add(ParkingSpot(spot_number=i))
            session.commit()


def get_session():
    with Session(engine) as session:
        yield session
