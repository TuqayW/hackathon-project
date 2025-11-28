from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models import Place
from app.schemas import PlaceOut
from app.services.distance import haversine
from app.auth import get_db

router = APIRouter(prefix="/detect", tags=["Detection"])

MAX_DISTANCE = 100  # meters


@router.get("/", response_model=PlaceOut)
def detect(lat: float, lng: float, db: Session = Depends(get_db)):

    places = db.query(Place).all()

    nearest = None
    min_dist = float("inf")

    for p in places:
        d = haversine(lat, lng, p.lat, p.lng)
        if d < min_dist:
            min_dist = d
            nearest = p

    if nearest is None or min_dist > MAX_DISTANCE:
        raise HTTPException(404, "No place detected nearby")

    return PlaceOut(
        id=nearest.id,
        name=nearest.name,
        description=nearest.description,
        lat=nearest.lat,
        lng=nearest.lng,
        image_url=nearest.image_path.replace("app", ""),
        distance_m=min_dist
    )
