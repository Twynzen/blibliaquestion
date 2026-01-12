from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from src.config import settings
from src.database import initialize_firebase

# Import routers
from src.auth.router import router as auth_router
from src.tournaments.router import router as tournaments_router
from src.questions.router import router as questions_router
from src.challenges.router import router as challenges_router
from src.scores.router import router as scores_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    initialize_firebase()
    print(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    yield
    # Shutdown
    print("Shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API para la plataforma de torneos biblicos Biblia Question",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT
    }


# Include routers
app.include_router(auth_router, prefix=f"{settings.API_PREFIX}/auth", tags=["auth"])
app.include_router(tournaments_router, prefix=f"{settings.API_PREFIX}/tournaments", tags=["tournaments"])
app.include_router(questions_router, prefix=f"{settings.API_PREFIX}/questions", tags=["questions"])
app.include_router(challenges_router, prefix=f"{settings.API_PREFIX}/challenges", tags=["challenges"])
app.include_router(scores_router, prefix=f"{settings.API_PREFIX}/scores", tags=["scores"])


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs" if settings.DEBUG else "Disabled in production"
    }
