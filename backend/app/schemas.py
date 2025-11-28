from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PlaceCreate(BaseModel):
    name: str
    description: str
    lat: float
    lng: float


class PlaceOut(BaseModel):
    id: int
    name: str
    description: str
    lat: float
    lng: float
    image_url: str
    distance_m: float | None = None

    class Config:
        orm_mode = True
