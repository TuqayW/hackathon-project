import os
from fastapi import HTTPException


# -------------------------
# Path helpers
# -------------------------

def ensure_directory(path: str):
    """Create a directory if not exists."""
    if not os.path.exists(path):
        os.makedirs(path)


def clean_path(path: str):
    """Normalize local file path for consistent usage."""
    return path.replace("\\", "/")


# -------------------------
# Coordinate validation
# -------------------------

def validate_coordinates(lat: float, lng: float):
    """
    Ensures latitude and longitude values are valid.
    """
    if lat < -90 or lat > 90:
        raise HTTPException(400, detail="Invalid latitude value")
    if lng < -180 or lng > 180:
        raise HTTPException(400, detail="Invalid longitude value")


# -------------------------
# Custom API errors
# -------------------------

def error(message: str, code: int = 400):
    """
    Shortcut for returning consistent API errors.
    """
    raise HTTPException(status_code=code, detail=message)


# -------------------------
# Distance formatting
# -------------------------

def format_distance(meters: float) -> str:
    """
    Converts meters to a human-readable string.
    """
    if meters < 1000:
        return f"{meters:.1f} m"
    return f"{meters/1000:.2f} km"


# -------------------------
# Basic logging helper
# -------------------------

def log(message: str):
    """
    Lightweight logging for debugging.
    """
    print(f"[LOG] {message}")
