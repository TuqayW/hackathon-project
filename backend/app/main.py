from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.database import Base, engine
from app.routers import auth_router, place_router, detect_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.mount("/uploads", StaticFiles(directory="app/uploads"), name="uploads")

app.include_router(auth_router.router)
app.include_router(place_router.router)
app.include_router(detect_router.router)
