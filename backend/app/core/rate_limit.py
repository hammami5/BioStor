import time
from collections import defaultdict, deque
from typing import Deque, Dict

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings


class RateLimitExceeded(Exception):
    pass


class InMemoryRateLimiter:
    """Sliding-window in-memory rate limiter keyed by (scope, client_ip)."""

    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._hits: Dict[str, Deque[float]] = defaultdict(deque)
        self._lock = None

    def _key(self, client_ip: str) -> str:
        return f"{client_ip}"

    def allow(self, client_ip: str) -> bool:
        now = time.monotonic()
        key = self._key(client_ip)
        window = self._hits[key]
        while window and now - window[0] > self.window_seconds:
            window.popleft()
        if len(window) >= self.max_requests:
            return False
        window.append(now)
        return True


_general_limiter = InMemoryRateLimiter(
    settings.RATE_LIMIT_REQUESTS, settings.RATE_LIMIT_WINDOW_SECONDS
)
_auth_limiter = InMemoryRateLimiter(
    settings.AUTH_RATE_LIMIT_REQUESTS, settings.AUTH_RATE_LIMIT_WINDOW_MINUTES * 60
)

AUTH_PATHS = ("/api/v1/auth",)


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if not settings.RATE_LIMIT_ENABLED:
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        path = request.url.path

        is_auth = path.startswith(AUTH_PATHS)
        limiter = _auth_limiter if is_auth else _general_limiter

        if not limiter.allow(client_ip):
            return Response(
                status_code=429,
                content="Too many requests. Please try again later.",
                headers={"Retry-After": str(limiter.window_seconds)},
                media_type="text/plain",
            )
        return await call_next(request)
