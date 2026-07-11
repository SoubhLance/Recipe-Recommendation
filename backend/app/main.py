from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.state import app_state
from app.routes import router as api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load all models and precomputed tables once at startup
    app_state.load()
    yield
    # Shutdown cleanups can go here if necessary
    print("Shutting down Application...")

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description="AI-powered recipe similarity search and personalized hybrid recommendation engine.",
        version="1.0.0",
        # Use the default openapi.json path so /docs and /redoc resolve correctly
        openapi_url="/openapi.json",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan
    )
    
    # Configure CORS middleware
    if settings.CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
    # Register core API routes prefixing /api
    app.include_router(api_router, prefix=settings.API_V1_STR)
    
    @app.get("/", tags=["Root"])
    def root():
        """Root health-check endpoint. Confirms the API is running."""
        return {
            "name": settings.PROJECT_NAME,
            "status": "running",
            "docs": "/docs",
            "redoc": "/redoc",
            "health": "/api/health",
            "version": "1.0.0"
        }
        
    return app

app = create_app()
