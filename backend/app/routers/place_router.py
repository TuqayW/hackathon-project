from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.models import Place
from app.schemas import PlaceCreate, PlaceOut
from app.auth import admin_required, get_db
import shutil
import uuid
import os

router = APIRouter(prefix="/places", tags=["Places"])


UPLOAD_DIR = "app/uploads/"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/add", response_model=PlaceOut)
def add_place(
    info: PlaceCreate,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin=Depends(admin_required)
):
    filename = f"{uuid.uuid4()}_{image.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    place = Place(
        name=info.name,
        description=info.description,
        lat=info.lat,
        lng=info.lng,
        image_path=filepath
    )
    db.add(place)
    db.commit()
    db.refresh(place)

    return PlaceOut(
        id=place.id,
        name=place.name,
        description=place.description,
        lat=place.lat,
        lng=place.lng,
        image_url=f"/uploads/{filename}",
    )
