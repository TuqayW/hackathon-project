from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas import UserCreate, Token
from app import models
from app.auth import hash_password, verify_password, create_access_token, get_db

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(400, "Username already exists")

    new_user = models.User(
        username=user.username,
        password=hash_password(user.password),
        is_admin=False
    )
    db.add(new_user)
    db.commit()

    token = create_access_token({"sub": user.username})
    return {"access_token": token}


@router.post("/login", response_model=Token)
def login(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(401, "Invalid credentials")

    token = create_access_token({"sub": db_user.username})
    return {"access_token": token}
