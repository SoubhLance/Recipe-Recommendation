export interface FilterParams {
  max_calories?: number | null;
  max_time_mins?: number | null;
  vegetarian?: boolean | null;
  vegan?: boolean | null;
  cuisine?: string | null;
  healthy?: boolean | null;
}

export interface RecommendRequest {
  mode: 'content' | 'hybrid';
  user_id?: number | null;
  recipe_id?: number | null;
  query?: string | null;
  filters?: FilterParams | null;
  top_n: number;
}

export interface RecipeResponse {
  id?: number | null;
  title: string;
  ingredients: string[];
  instructions: string[];
  description: string;
  source: string;
  nutrition_available: boolean;
  calories?: number | null;
  total_fat_pdv?: number | null;
  sugar_pdv?: number | null;
  sodium_pdv?: number | null;
  protein_pdv?: number | null;
  sat_fat_pdv?: number | null;
  carbs_pdv?: number | null;
  similarity_score?: number | null;
  ranker_score?: number | null;
  explanation?: string | null;
  cooking_time_mins?: number | null;
}

export interface StatsResponse {
  dataset_size: number;
  embedding_model: string;
  embedding_dimension: number;
  faiss_index_type: string;
  avg_tokens: number;
  avg_ingredients: number;
  avg_steps: number;
  nutrition_coverage: number;
  sparsity: number;
  cold_start_pct: number;
  eval_results: Record<string, number>;
}

export interface HealthResponse {
  status: string;
  models_loaded: boolean;
  sbert_cached: boolean;
  memory_usage_mb: number;
  uptime_seconds: number;
}

export interface UserProfile {
  user_id: number;
  favorite_recipe_id: number;
  favorite_recipe_title: string;
}
