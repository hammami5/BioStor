from sqlalchemy import make_url
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

connect_args = {}
db_url = settings.DATABASE_URL

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    # Postgres via asyncpg: SQLAlchemy forwards `?sslmode=...` from the URL as a
    # connect() kwarg, which asyncpg doesn't accept. Strip it and pass SSL through
    # connect_args instead (required for Neon).
    parsed = make_url(db_url)
    if "sslmode" in parsed.query:
        query = {k: v for k, v in parsed.query.items() if k != "sslmode"}
        db_url = parsed.set(query=query).render_as_string(hide_password=False)
        connect_args["ssl"] = "require"
    # Keep session timestamps in UTC so naive datetimes are stored/read as UTC.
    connect_args["server_settings"] = {"timezone": "utc"}

engine = create_async_engine(
    db_url,
    echo=settings.DEBUG,
    future=True,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args=connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)

Base = declarative_base()


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db() -> None:
    from app.models import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    await engine.dispose()
