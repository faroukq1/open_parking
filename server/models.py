from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


# ════════════════════════════════
#  ENUMS
# ════════════════════════════════

class UserType(str, Enum):
    resident = "resident"
    visitor  = "visitor"


class BookingStatus(str, Enum):
    reserved  = "reserved"
    active    = "active"
    completed = "completed"
    cancelled = "cancelled"


# ════════════════════════════════
#  TABLES
# ════════════════════════════════

class User(SQLModel, table=True):
    id:              Optional[int] = Field(default=None, primary_key=True)
    full_name:       str
    email:           str           = Field(unique=True)
    phone:           str
    hashed_password: str
    user_type:       UserType      = UserType.visitor
    room_number:     Optional[str] = None
    created_at:      datetime      = Field(default_factory=datetime.utcnow)
    expo_push_token: Optional[str] = None
    pending_entry:   bool          = False
    is_enter:        bool          = False  # True while car is physically inside the lot


class Vehicle(SQLModel, table=True):
    id:           Optional[int] = Field(default=None, primary_key=True)
    user_id:      int           = Field(foreign_key="user.id")
    plate_number: str           = Field(unique=True)  # e.g. 12345-111-16
    created_at:   datetime      = Field(default_factory=datetime.utcnow)


class ParkingSpot(SQLModel, table=True):
    id:           Optional[int] = Field(default=None, primary_key=True)
    spot_number:  int           = Field(unique=True)
    is_available: bool          = True


class Booking(SQLModel, table=True):
    id:          Optional[int]      = Field(default=None, primary_key=True)
    user_id:     int                = Field(foreign_key="user.id")
    vehicle_id:  int                = Field(foreign_key="vehicle.id")
    spot_id:     int                = Field(foreign_key="parkingspot.id")
    status:      BookingStatus      = BookingStatus.reserved
    reserved_at: datetime           = Field(default_factory=datetime.utcnow)
    entered_at:  Optional[datetime] = None
    exited_at:   Optional[datetime] = None


# ════════════════════════════════
#  REQUEST SCHEMAS
# ════════════════════════════════

class UserCreate(SQLModel):
    full_name:    str
    email:        str
    phone:        str
    password:     str
    user_type:    UserType      = UserType.visitor
    room_number:  Optional[str] = None
    plate_numbers: list[str]    = Field(default_factory=list)   # one or more cars at register time


class LoginRequest(SQLModel):
    email:    str
    password: str


class VehicleCreate(SQLModel):
    plate_number: str            # add a single car after register


class BookingCreate(SQLModel):
    vehicle_id: int
    spot_id:    int


class PlateVerify(SQLModel):
    plate_number: str
    gate:         str            # "entry" or "exit"


# ════════════════════════════════
#  RESPONSE SCHEMAS
# ════════════════════════════════

class UserRead(SQLModel):
    id:          int
    full_name:   str
    email:       str
    phone:       str
    user_type:   UserType
    room_number: Optional[str]
    created_at:  datetime


class VehicleRead(SQLModel):
    id:           int
    user_id:      int
    plate_number: str
    created_at:   datetime


class UserReadWithVehicles(SQLModel):
    id:          int
    full_name:   str
    email:       str
    phone:       str
    user_type:   UserType
    room_number: Optional[str]
    created_at:  datetime
    vehicles:    list[VehicleRead] = Field(default_factory=list)
    is_enter:    bool              = False


class SpotRead(SQLModel):
    id:           int
    spot_number:  int
    is_available: bool


class BookingRead(SQLModel):
    id:          int
    user_id:     int
    vehicle_id:  int
    spot_id:     int
    status:      BookingStatus
    reserved_at: datetime
    entered_at:  Optional[datetime]
    exited_at:   Optional[datetime]