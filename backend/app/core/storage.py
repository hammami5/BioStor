import os
import uuid
from pathlib import Path
from typing import Optional

import aiofiles
from fastapi import UploadFile

from app.core.config import settings

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"}

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"}


class StorageError(Exception):
    pass


async def save_upload(file: UploadFile) -> str:
    """Saves an uploaded image and returns its public URL path.

    Architecture note: storage is behind this single function so a real cloud
    provider (S3 / Supabase Storage) can be plugged in later without touching
    the API layer. The returned value is always a relative URL that the frontend
    prefixes with the API origin.
    """
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise StorageError("Unsupported file type. Allowed: JPEG, PNG, WebP, GIF, SVG.")

    original = file.filename or "image"
    ext = Path(original).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        ext = ".png"

    if settings.STORAGE_PROVIDER == "supabase":
        return await _save_supabase(file, ext)
    return await _save_local(file, ext)


async def _save_local(file: UploadFile, ext: str) -> str:
    upload_dir = Path(settings.UPLOAD_DIR)
    (upload_dir / "products").mkdir(parents=True, exist_ok=True)
    (upload_dir / "logos").mkdir(parents=True, exist_ok=True)

    max_bytes = settings.UPLOAD_MAX_SIZE_MB * 1024 * 1024
    name = f"{uuid.uuid4().hex}{ext}"

    dest = upload_dir / "products" / name
    size = 0
    async with aiofiles.open(dest, "wb") as out:
        while chunk := await file.read(1024 * 1024):
            size += len(chunk)
            if size > max_bytes:
                await out.close()
                os.remove(dest)
                raise StorageError("File too large.")
            await out.write(chunk)

    return f"/uploads/products/{name}"


async def _save_supabase(file: UploadFile, ext: str) -> str:
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        raise StorageError("Supabase storage is not configured.")

    from supabase import create_client, Client

    supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    name = f"{uuid.uuid4().hex}{ext}"
    content = await file.read()
    supabase.storage.from_(settings.SUPABASE_BUCKET).upload(
        f"products/{name}", content, {"content-type": file.content_type or "image/png"}
    )
    public_url = supabase.storage.from_(settings.SUPABASE_BUCKET).get_public_url(
        f"products/{name}"
    )
    return public_url
