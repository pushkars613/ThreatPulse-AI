import os
import shutil

from fastapi import APIRouter, HTTPException, UploadFile, File

from app.ai import analyze
from app.config import get_settings
from app.parser import parse_csv

router = APIRouter()


@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    settings = get_settings()

    filename = os.path.basename(file.filename or "")
    if not filename:
        raise HTTPException(status_code=400, detail="Uploaded file must have a filename")

    if not filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV log uploads are supported right now")

    settings.resolved_upload_dir.mkdir(parents=True, exist_ok=True)
    path = settings.resolved_upload_dir / filename

    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    max_upload_bytes = settings.max_upload_mb * 1024 * 1024
    if path.stat().st_size > max_upload_bytes:
        path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=413,
            detail=f"CSV uploads must be {settings.max_upload_mb} MB or smaller",
        )

    events = parse_csv(path)

    try:
        result = analyze(events)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return result
