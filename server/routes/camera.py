import cv2
import easyocr
import numpy as np
import re
import httpx
from fastapi import APIRouter, UploadFile, File, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import Vehicle, User, Booking, BookingStatus
from fastapi import Depends

router = APIRouter(prefix="/camera", tags=["camera"])

# ── Initialize EasyOCR once at startup (heavy model load) ──
# English + French — covers Algerian/European plates
reader = easyocr.Reader(["en", "fr"], gpu=False)


def preprocess_image(img_bytes: bytes) -> np.ndarray:
    """Enhance image for better OCR accuracy."""
    # Decode bytes → numpy array
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # 1. Resize if too small (helps OCR)
    h, w = img.shape[:2]
    if w < 800:
        scale = 800 / w
        img = cv2.resize(img, (int(w * scale), int(h * scale)))

    # 2. Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 3. Increase contrast with CLAHE
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)

    # 4. Denoise
    denoised = cv2.fastNlMeansDenoising(enhanced, h=10)

    # 5. Sharpen
    kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
    sharpened = cv2.filter2D(denoised, -1, kernel)

    return sharpened


def extract_plate_text(img_array: np.ndarray) -> list[str]:
    """Run EasyOCR and return cleaned plate candidates."""
    results = reader.readtext(img_array, detail=1, paragraph=False)

    candidates = []
    for (_, text, confidence) in results:
        if confidence < 0.3:
            continue
        # Clean: remove spaces, dashes, dots → uppercase
        cleaned = re.sub(r"[^A-Z0-9]", "", text.upper())
        # Plates are usually 4-10 characters
        if 4 <= len(cleaned) <= 10:
            candidates.append(cleaned)

    return candidates


# ── POST /camera/verify ──────────────────────────────────────
@router.post("/verify")
async def verify_plate(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
):
    # 1. Read uploaded image
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    img_bytes = await file.read()

    # 2. Preprocess
    processed = preprocess_image(img_bytes)

    # 3. OCR — get plate candidates
    candidates = extract_plate_text(processed)

    if not candidates:
        return {
            "found":       False,
            "plate_read":  None,
            "candidates":  [],
            "message":     "No plate text detected in image",
        }

    # 4. Search DB for each candidate
    for plate in candidates:
        vehicle = session.exec(
            select(Vehicle).where(Vehicle.plate_number == plate)
        ).first()

        if vehicle:
            # Get owner info
            user = session.get(User, vehicle.user_id)

            # Set pending_entry = True
            if user:
                user.pending_entry = True
                session.add(user)
                session.commit()

                # Send push notification if user has a token
                if user.expo_push_token:
                    try:
                        with httpx.Client() as client:
                            client.post(
                                "https://exp.host/--/api/v2/push/send",
                                json={
                                    "to": user.expo_push_token,
                                    "title": "Parking Entry",
                                    "body": "Your plate was scanned. Please select your parking spot.",
                                    "data": {"screen": "parking"},
                                },
                                headers={"Content-Type": "application/json"},
                                timeout=5.0,
                            )
                    except Exception:
                        pass  # Don't fail the endpoint if push notification fails

            # Check if user has active booking
            active_booking = session.exec(
                select(Booking).where(
                    Booking.vehicle_id == vehicle.id,
                    Booking.status.in_([BookingStatus.active, BookingStatus.reserved]),
                )
            ).first()

            return {
                "found":      True,
                "plate_read": plate,
                "candidates": candidates,
                "vehicle": {
                    "id":           vehicle.id,
                    "plate_number": vehicle.plate_number,
                },
                "user": {
                    "id":        user.id,
                    "full_name": user.full_name,
                    "user_type": user.user_type,
                } if user else None,
                "has_active_booking": active_booking is not None,
                "booking_id": active_booking.id if active_booking else None,
            }

    # 5. Nothing matched in DB
    return {
        "found":      False,
        "plate_read": candidates[0] if candidates else None,
        "candidates": candidates,
        "message":    f"Plate(s) {candidates} not registered in system",
    }


# ── POST /camera/verify-gate ─────────────────────────────────
# Full gate control: entry/exit with barrier logic
@router.post("/verify-gate")
async def verify_gate(
    gate: str,   # "entry" or "exit"
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
):
    from datetime import datetime

    if gate not in ("entry", "exit"):
        raise HTTPException(status_code=400, detail="gate must be 'entry' or 'exit'")

    img_bytes = await file.read()
    processed = preprocess_image(img_bytes)
    candidates = extract_plate_text(processed)

    if not candidates:
        return {"action": "DENY", "reason": "No plate detected"}

    for plate in candidates:
        vehicle = session.exec(
            select(Vehicle).where(Vehicle.plate_number == plate)
        ).first()

        if not vehicle:
            continue

        booking = session.exec(
            select(Booking).where(
                Booking.vehicle_id == vehicle.id,
                Booking.status.in_([BookingStatus.active, BookingStatus.reserved]),
            )
        ).first()

        if not booking:
            return {"action": "DENY", "plate_read": plate, "reason": "No active booking found"}

        if gate == "entry":
            booking.entered_at = datetime.utcnow()
            booking.status = BookingStatus.active
            session.add(booking)
            session.commit()
            return {
                "action":     "OPEN_ENTRY_BARRIER",
                "plate_read": plate,
                "booking_id": booking.id,
                "spot_id":    booking.spot_id,
            }

        elif gate == "exit":
            from models import ParkingSpot
            booking.exited_at = datetime.utcnow()
            booking.status = BookingStatus.completed
            # Free the spot
            spot = session.get(ParkingSpot, booking.spot_id)
            if spot:
                spot.is_available = True
                session.add(spot)
            session.add(booking)
            session.commit()
            return {
                "action":     "OPEN_EXIT_BARRIER",
                "plate_read": plate,
                "booking_id": booking.id,
            }

    return {
        "action":     "DENY",
        "candidates": candidates,
        "reason":     "Plate not registered or no active booking",
    }