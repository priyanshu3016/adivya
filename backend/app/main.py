import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app import __version__
from app.core.config import settings

logger = logging.getLogger("tribalscholar")

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


# Global Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Format request validation errors consistently."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": exc.errors(),
            "message": "Input validation error",
        },
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Pass through HTTP exceptions with structured response format."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Catch-all unhandled server error handler."""
    logger.error("Unhandled internal server exception: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )


# Health Check Endpoints
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


# Router Inclusions
from app.routes.auth import router as auth_router
from app.routes.schemes import router as schemes_router
from app.routes.applications import router as applications_router
from app.routes.applicant import router as applicant_router
from app.routes.documents import router as documents_router
from app.routes.verification import router as verification_router
from app.routes.admin import router as admin_router

app.include_router(auth_router)
app.include_router(schemes_router)
app.include_router(applications_router)
app.include_router(applicant_router)
app.include_router(documents_router)
app.include_router(verification_router)
app.include_router(admin_router)
