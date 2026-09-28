from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=__version__,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware for prototype development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["health"])
async def health_check():
    return {
        "status": "healthy",
        "version": __version__,
        "project": settings.PROJECT_NAME,
    }


@app.get(f"{settings.API_V1_STR}/health", tags=["health"])
@app.get("/api/v1/health", include_in_schema=False)
async def api_v1_health_check():
    return {
        "status": "healthy",
        "version": __version__,
        "project": settings.PROJECT_NAME,
    }


# Router inclusions
from app.routes.auth import router as auth_router
from app.routes.schemes import router as schemes_router

app.include_router(auth_router)
app.include_router(schemes_router)
