import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import create_tables, seed_spots
from routes.auth import router as auth_router
from routes.spots import router as spots_router
from routes.bookings import router as bookings_router
from routes.users import router as users_router
from routes.camera import router as camera_router

app = FastAPI(title="Smart Parking API", version="1.0.0")

origins_raw = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in origins_raw.split(",") if origin.strip()]
allow_all_origins = "*" in allowed_origins or not allowed_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all_origins else allowed_origins,
    allow_credentials=not allow_all_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    create_tables()
    seed_spots()


@app.get("/")
def hello():
    return {"message": "Smart Parking API is running 🚗"}


app.include_router(auth_router)
app.include_router(spots_router)
app.include_router(bookings_router)
app.include_router(users_router)
app.include_router(camera_router)