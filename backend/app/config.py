import os
from pathlib import Path
from pydantic_settings import BaseSettings

# Resolve base directories dynamically
APP_DIR = Path(__file__).resolve().parent
BACKEND_DIR = APP_DIR.parent
PROJECT_ROOT = BACKEND_DIR.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Recipe Recommendation Dashboard"
    API_V1_STR: str = "/api"
    
    # Core asset paths
    RECIPES_PARQUET_PATH: Path = BACKEND_DIR / "datasets" / "processed" / "feature_engineered_recipes.parquet"
    EMBEDDINGS_PATH: Path = BACKEND_DIR / "datasets" / "embeddings" / "sbert_embeddings.npy"
    FAISS_INDEX_PATH: Path = BACKEND_DIR / "datasets" / "embeddings" / "faiss_index.bin"
    
    # Saved ML models
    SVD_MODEL_PATH: Path = BACKEND_DIR / "models" / "svd_model.pkl"
    HYBRID_RANKER_PATH: Path = BACKEND_DIR / "models" / "hybrid_ranker.pkl"
    NUTRITION_SCALER_PATH: Path = BACKEND_DIR / "models" / "nutrition_scaler.pkl"
    
    # Interactions for user lookup (historical profiling)
    INTERACTIONS_CSV_PATH: Path = BACKEND_DIR / "datasets" / "RAW_interactions.csv"
    
    # CORS Origins
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",  # Vite default port
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000"
    ]
    
    class Config:
        case_sensitive = True

settings = Settings()
