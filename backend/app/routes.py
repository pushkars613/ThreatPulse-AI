import os
import shutil

from fastapi import APIRouter, UploadFile, File

from app.parser import parse_csv
from app.ai import analyze

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload(file: UploadFile = File(...)):

    path = os.path.join(UPLOAD_DIR, file.filename)

    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    if file.filename.endswith(".csv"):
        events = parse_csv(path)
    else:
        events = []

    result = analyze(events)

    return result