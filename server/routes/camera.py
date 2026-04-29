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
try:
    reader = easyocr.Reader(["en", "fr"], gpu=False)
    OCR_INIT_ERROR = None
except Exception as exc:
    reader = None
    OCR_INIT_ERROR = str(exc)


def preprocess_image(img_bytes: bytes) -> np.ndarray:
    """Enhance image for better OCR accuracy."""
    # Decode bytes → numpy array
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Invalid or unsupported image file")

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
    if reader is None:
        return []

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
# First scan → entry; second scan (is_enter=True) → exit
@router.post("/verify")
async def verify_plate(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
):
    from datetime import datetime
    from models import ParkingSpot

    if reader is None:
        raise HTTPException(
            status_code=503,
            detail=f"OCR engine unavailable: {OCR_INIT_ERROR or 'initialization failed'}",
        )

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    img_bytes = await file.read()
    try:
        processed = preprocess_image(img_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    candidates = extract_plate_text(processed)

    if not candidates:
        return {"action": "DENY", "reason": "No plate detected", "found": False}

    for plate in candidates:
        vehicle = session.exec(
            select(Vehicle).where(Vehicle.plate_number == plate)
        ).first()

        if not vehicle:
            continue

        user = session.get(User, vehicle.user_id)

        booking = session.exec(
            select(Booking).where(
                Booking.vehicle_id == vehicle.id,
                Booking.status.in_([BookingStatus.active, BookingStatus.reserved]),
            )
        ).first()

        # is_inside only when flag is set AND a booking exists
        is_inside = user and user.is_enter and booking

        if not is_inside:
            # Entry: open barrier and let user pick their spot manually
            if user:
                user.is_enter = True
                session.add(user)
                session.commit()

            if user and user.expo_push_token:
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
                    pass

            return {
                "action":     "OPEN_ENTRY_BARRIER",
                "plate_read": plate,
                "found":      True,
            }
        else:
            # Exit: complete booking, free spot, reset flag
            booking.exited_at = datetime.utcnow()
            booking.status = BookingStatus.completed
            spot = session.get(ParkingSpot, booking.spot_id)
            if spot:
                spot.is_available = True
                session.add(spot)
            user.is_enter = False
            session.add(user)
            session.add(booking)
            session.commit()
            return {
                "action":     "OPEN_EXIT_BARRIER",
                "plate_read": plate,
                "booking_id": booking.id,
                "found":      True,
            }

    return {
        "action":     "DENY",
        "candidates": candidates,
        "reason":     "Plate not registered or no active booking",
        "found":      False,
    }