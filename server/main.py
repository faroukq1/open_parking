from fastapi import FastAPI
from database import create_tables, seed_spots

app = FastAPI(title="Smart Parking API", version="1.0.0")


@app.on_event("startup")
def startup():
    create_tables()
    seed_spots()


@app.get("/")
def hello():
    return {"message": "Smart Parking API is running 🚗"}