from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import init_db, close_db
from app.core.rate_limit import RateLimitMiddleware
from app.api.v1 import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    if settings.SEED_DEMO_DATA:
        from app.seed import seed_demo_data

        await seed_demo_data()
    yield
    await close_db()


app = FastAPI(
    title=settings.APP_NAME,
    description="BioStor API — Turn your Instagram bio into a professional store",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RateLimitMiddleware)

# Serve uploaded images locally (swap for a CDN in production)
upload_dir = Path(settings.UPLOAD_DIR)
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return {"name": "BioStor API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
