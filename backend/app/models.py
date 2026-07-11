from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class FilterParams(BaseModel):
    max_calories: Optional[float] = Field(None, description="Max calories limit")
    max_time_mins: Optional[float] = Field(None, description="Max cooking time in minutes")
    vegetarian: Optional[bool] = Field(None, description="Filter for vegetarian tags/ingredients")
    vegan: Optional[bool] = Field(None, description="Filter for vegan tags/ingredients")
    cuisine: Optional[str] = Field(None, description="Cuisine tag match")
    healthy: Optional[bool] = Field(None, description="High protein, low fat, low sodium option")

class RecommendRequest(BaseModel):
    mode: str = Field("content", description="Recommendation mode: 'content' or 'hybrid'")
    user_id: Optional[int] = Field(None, description="User ID for collaborative/hybrid ranking")
    recipe_id: Optional[int] = Field(None, description="Anchor recipe ID for finding similar recipes")
    query: Optional[str] = Field(None, description="Free-text search or ingredient query")
    filters: Optional[FilterParams] = Field(None, description="Optional recipe filters")
    top_n: int = Field(10, ge=1, le=100, description="Number of recommendations to return")

class RecipeResponse(BaseModel):
    id: Optional[int] = None
    title: str
    ingredients: List[str]
    instructions: List[str]
    description: str
    source: str
    nutrition_available: bool
    calories: Optional[float] = None
    total_fat_pdv: Optional[float] = None
    sugar_pdv: Optional[float] = None
    sodium_pdv: Optional[float] = None
    protein_pdv: Optional[float] = None
    sat_fat_pdv: Optional[float] = None
    carbs_pdv: Optional[float] = None
    
    # Matching details
    similarity_score: Optional[float] = None
    ranker_score: Optional[float] = None
    explanation: Optional[str] = None
    cooking_time_mins: Optional[int] = None # Mapping 'minutes' field if present

class StatsResponse(BaseModel):
    dataset_size: int
    embedding_model: str
    embedding_dimension: int
    faiss_index_type: str
    avg_tokens: float
    avg_ingredients: float
    avg_steps: float
    nutrition_coverage: float
    sparsity: float
    cold_start_pct: float
    eval_results: Dict[str, float]

class HealthResponse(BaseModel):
    status: str
    models_loaded: bool
    sbert_cached: bool
    memory_usage_mb: float
    uptime_seconds: float
