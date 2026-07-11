import time
import os
import psutil
import pandas as pd
from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional, Dict
from app.state import app_state
from app.models import RecommendRequest, RecipeResponse, StatsResponse, HealthResponse
from app.recommender import recommender

router = APIRouter()
start_time = time.time()

@router.get("/health", response_model=HealthResponse)
def get_health():
    """Gets application health, memory usage, and initialization status."""
    if not app_state.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Models and database are still initializing."
        )
    
    # Calculate memory usage
    try:
        process = psutil.Process(os.getpid())
        memory_mb = process.memory_info().rss / (1024 * 1024)
    except Exception:
        memory_mb = 0.0
        
    return HealthResponse(
        status="healthy",
        models_loaded=app_state.is_loaded,
        sbert_cached=app_state.sbert_model is not None,
        memory_usage_mb=round(memory_mb, 2),
        uptime_seconds=round(time.time() - start_time, 2)
    )

@router.get("/stats", response_model=StatsResponse)
def get_stats():
    """Serves high-fidelity dataset, model evaluation, and index statistics."""
    if not app_state.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database state is not loaded."
        )
        
    # Standard statistics based on datasets & notebook findings
    return StatsResponse(
        dataset_size=len(app_state.df),
        embedding_model="all-MiniLM-L6-v2 (Sentence-BERT)",
        embedding_dimension=384,
        faiss_index_type="IndexFlatIP (Cosine Similarity Search)",
        avg_tokens=180.5,
        avg_ingredients=9.2,
        avg_steps=8.5,
        nutrition_coverage=65.0,  # 65% of rows have nutrition (Food.com subset)
        sparsity=99.9978,        # sparsity of rating matrix
        cold_start_pct=73.4,      # % users with only 1 interaction
        eval_results={
            "Popularity Heuristic": 0.0020,
            "SVD Collaborative Filtering": 0.0030,
            "Learned Hybrid Ranker": 0.0035,
            "Content-Based Model (SBERT+FAISS)": 0.0050
        }
    )

@router.get("/recipes/sample", response_model=List[RecipeResponse])
def get_sample_recipes():
    """Returns a curated list of interesting recipes for display on the landing page."""
    if not app_state.is_loaded:
        raise HTTPException(status_code=503, detail="App state initializing")
        
    # We pick indices of 6 diverse, common recipes
    sample_titles = [
        "Lasagna", "Chocolate Chip Cookies", "Chicken Curry", 
        "Vegetarian Chili", "Banana Bread", "Greek Salad"
    ]
    
    samples = []
    for title in sample_titles:
        matches = app_state.df[app_state.df["title"].str.contains(title.lower(), na=False)]
        if not matches.empty:
            idx = matches.index[0]
            row = app_state.df.iloc[idx]
            r_id = row.get("id")
            int_id = int(r_id) if pd.notna(r_id) else None
            samples.append(recommender.build_recipe_response(row, similarity_score=1.0))
            
    # Fallback to first 6 if any match was empty
    if len(samples) < 6:
        for i in range(min(6, len(app_state.df))):
            row = app_state.df.iloc[i]
            samples.append(recommender.build_recipe_response(row, similarity_score=1.0))
            
    return samples[:6]

@router.get("/users/sample")
def get_sample_users():
    """Returns a select group of user IDs with active history for collaborative demo switching."""
    if not app_state.is_loaded:
        raise HTTPException(status_code=503, detail="App state initializing")
        
    # Choose 10 active user IDs from our precomputed top reference mapping
    sample_users = list(app_state.user_top_recipe.keys())[:15]
    
    user_profiles = []
    for uid in sample_users:
        ref_recipe_id = app_state.user_top_recipe[uid]
        ref_title = app_state.recipe_id_to_title.get(ref_recipe_id, "Unknown Recipe")
        user_profiles.append({
            "user_id": uid,
            "favorite_recipe_id": ref_recipe_id,
            "favorite_recipe_title": ref_title.title()
        })
        
    return user_profiles

@router.get("/recipes/{recipe_id}", response_model=RecipeResponse)
def get_recipe_details(recipe_id: int):
    """Fetches full recipe card details by integer ID."""
    if not app_state.is_loaded:
        raise HTTPException(status_code=503, detail="App state initializing")
        
    if recipe_id not in app_state.id_to_embedding_idx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipe ID {recipe_id} not found in database catalog."
        )
        
    idx = app_state.id_to_embedding_idx[recipe_id]
    row = app_state.df.iloc[idx]
    return recommender.build_recipe_response(row)

@router.post("/recommend", response_model=List[RecipeResponse])
def get_recommendations(request: RecommendRequest):
    """Unified endpoint serving similarities, text searches, and user hybrid recommendations."""
    if not app_state.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database state is initializing."
        )
        
    mode = request.mode.lower()
    
    if mode == "content":
        if request.recipe_id is not None:
            # Query similar items
            try:
                return recommender.recommend_by_similarity(
                    recipe_id=request.recipe_id,
                    top_n=request.top_n,
                    filters=request.filters
                )
            except ValueError as e:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
        elif request.query is not None and request.query.strip():
            # Query text search
            return recommender.recommend_by_text(
                query=request.query,
                top_n=request.top_n,
                filters=request.filters
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="For content mode, you must provide either a recipe_id or a search query."
            )
            
    elif mode == "hybrid":
        if request.user_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A valid user_id is required for personalized hybrid recommendations."
            )
        return recommender.recommend_hybrid(
            user_id=request.user_id,
            top_n=request.top_n,
            filters=request.filters
        )
        
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid mode. Supported modes are 'content' or 'hybrid'."
        )
