import pickle
import time
import pandas as pd
import numpy as np
import faiss
import joblib
from pathlib import Path
from typing import Optional, Dict, Any
from sentence_transformers import SentenceTransformer
from app.config import settings

class AppState:
    def __init__(self):
        self.df: Optional[pd.DataFrame] = None
        self.embeddings: Optional[np.ndarray] = None
        self.faiss_index: Optional[faiss.Index] = None
        self.svd_model: Any = None
        
        # Hybrid ranker details
        self.ranker_model: Any = None
        self.popularity_stats: Optional[pd.DataFrame] = None
        self.global_mean_rating: float = 4.0
        
        # Scaling nutrition
        self.nutrition_scaler: Any = None
        
        # Lazy loaded models
        self.sbert_model: Optional[SentenceTransformer] = None
        
        # Mappings
        self.user_top_recipe: Dict[int, int] = {}
        self.recipe_id_to_minutes: Dict[int, int] = {}
        self.id_to_embedding_idx: Dict[int, int] = {}
        self.recipe_id_to_title: Dict[int, str] = {}
        self.is_loaded: bool = False

    def load(self):
        if self.is_loaded:
            return
        
        print("Initializing Application State (AppState)...")
        start_time = time.time()
        
        # 1. Load Recipe DataFrame
        print(f"Loading recipes parquet from: {settings.RECIPES_PARQUET_PATH}")
        self.df = pd.read_parquet(settings.RECIPES_PARQUET_PATH)
        
        # 2. Build row indices mapping
        # Parquet has 'id' column representing recipe ID (for Food.com, NaN for RecipeNLG)
        print("Indexing recipe IDs...")
        for i, row in self.df.iterrows():
            r_id = row.get("id")
            title = row.get("title")
            if pd.notna(r_id):
                int_id = int(r_id)
                self.id_to_embedding_idx[int_id] = i
                self.recipe_id_to_title[int_id] = title
        
        # 3. Load precomputed embeddings
        print(f"Loading precomputed embeddings from: {settings.EMBEDDINGS_PATH}")
        self.embeddings = np.load(settings.EMBEDDINGS_PATH)
        
        # 4. Load FAISS index
        print(f"Loading FAISS index from: {settings.FAISS_INDEX_PATH}")
        self.faiss_index = faiss.read_index(str(settings.FAISS_INDEX_PATH))
        
        # 5. Load SVD Collaborative filtering model
        print(f"Loading SVD model from: {settings.SVD_MODEL_PATH}")
        with open(settings.SVD_MODEL_PATH, "rb") as f:
            self.svd_model = pickle.load(f)
            
        # 6. Load Hybrid Ranker model and stats
        print(f"Loading Hybrid ranker from: {settings.HYBRID_RANKER_PATH}")
        with open(settings.HYBRID_RANKER_PATH, "rb") as f:
            hybrid_data = pickle.load(f)
            self.ranker_model = hybrid_data["ranker"]
            self.popularity_stats = hybrid_data["popularity_stats"]
            self.global_mean_rating = hybrid_data["global_mean_rating"]
            
        # 7. Load nutrition scaler
        print(f"Loading nutrition scaler from: {settings.NUTRITION_SCALER_PATH}")
        self.nutrition_scaler = joblib.load(settings.NUTRITION_SCALER_PATH)
        
        # 8. Load user interactions and build high-rated lookup map
        print(f"Loading interactions for lookup from: {settings.INTERACTIONS_CSV_PATH}")
        # To optimize startup, we only load user_id and recipe_id and rating
        interactions = pd.read_csv(
            settings.INTERACTIONS_CSV_PATH,
            usecols=["user_id", "recipe_id", "rating"]
        )
        
        # Unify by filtering only to valid recipe IDs we have in the cleaned DataFrame
        valid_ids = set(self.id_to_embedding_idx.keys())
        interactions = interactions[interactions["recipe_id"].isin(valid_ids)]
        
        # Sort and drop duplicates to find the reference (highest-rated) recipe per user
        print("Precomputing user reference recipe mapping...")
        user_refs = (
            interactions.sort_values("rating", ascending=False)
            .drop_duplicates(subset="user_id", keep="first")
        )
        self.user_top_recipe = dict(zip(user_refs["user_id"].astype(int), user_refs["recipe_id"].astype(int)))
        
        # 9. Load cooking minutes from RAW_recipes.csv
        print("Loading cooking times from RAW_recipes.csv...")
        raw_recipes_path = settings.RECIPES_PARQUET_PATH.parent.parent / "RAW_recipes.csv"
        self.recipe_id_to_minutes = {}
        if raw_recipes_path.exists():
            try:
                minutes_df = pd.read_csv(raw_recipes_path, usecols=["id", "minutes"])
                self.recipe_id_to_minutes = dict(zip(minutes_df["id"].astype(int), minutes_df["minutes"].fillna(30).astype(int)))
                print(f"Loaded {len(self.recipe_id_to_minutes)} cooking times.")
            except Exception as e:
                print(f"Warning: could not load RAW_recipes.csv cooking times: {e}")
        else:
            print(f"Warning: RAW_recipes.csv not found at {raw_recipes_path}")
            
        self.is_loaded = True
        elapsed = time.time() - start_time
        print(f"AppState initialization complete in {elapsed:.2f} seconds.")

    def get_sbert_model(self) -> SentenceTransformer:
        """Lazily load SentenceTransformer model when needed for runtime text queries."""
        if self.sbert_model is None:
            print("Lazy loading Sentence-BERT Model (all-MiniLM-L6-v2)...")
            start = time.time()
            self.sbert_model = SentenceTransformer("all-MiniLM-L6-v2")
            print(f"SBERT loaded in {time.time() - start:.2f} seconds.")
        return self.sbert_model

app_state = AppState()
