from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models import User
from app.services.store import StoreService

router = APIRouter()


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    _: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Uploads an image and returns its URL. Used by the seller dashboard."""
    url = await StoreService(db).upload_image(file)
    return JSONResponse({"url": url})
