import time
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
from app.state import app_state
from app.models import FilterParams, RecipeResponse

class RecommenderSystem:
    def matches_filters(self, row: pd.Series, recipe_id: Optional[int], filters: Optional[FilterParams]) -> bool:
        if not filters:
            return True
            
        # 1. Calorie Ceiling
        if filters.max_calories is not None:
            cal = row.get("calories")
            if pd.isna(cal) or cal > filters.max_calories:
                return False
                
        # 2. Cooking Time Ceiling
        if filters.max_time_mins is not None:
            minutes = 30  # Default fallback
            if recipe_id is not None and recipe_id in app_state.recipe_id_to_minutes:
                minutes = app_state.recipe_id_to_minutes[recipe_id]
            if minutes > filters.max_time_mins:
                return False
                
        # 3. Vegetarian Filter
        ingredients = row.get("ingredients")
        if isinstance(ingredients, (list, np.ndarray)):
            ingredients_list = [str(ing).lower() for ing in ingredients]
        else:
            ingredients_list = []
            
        if filters.vegetarian:
            non_veg = {'chicken', 'beef', 'pork', 'lamb', 'bacon', 'turkey', 'shrimp', 'fish', 'salmon', 
                       'tuna', 'crab', 'lobster', 'seafood', 'sausage', 'ham', 'steak', 'meat', 'anchovy', 'pepperoni'}
            if any(any(nv in ing for nv in non_veg) for ing in ingredients_list):
                return False
                
        # 4. Vegan Filter
        if filters.vegan:
            non_vegan = {'chicken', 'beef', 'pork', 'lamb', 'bacon', 'turkey', 'shrimp', 'fish', 'salmon', 
                         'tuna', 'crab', 'lobster', 'seafood', 'sausage', 'ham', 'steak', 'meat', 'anchovy', 'pepperoni',
                         'milk', 'cheese', 'butter', 'egg', 'cream', 'yogurt', 'honey', 'mayo', 'mayonnaise', 'lard'}
            if any(any(nv in ing for nv in non_vegan) for ing in ingredients_list):
                return False
                
        # 5. Cuisine Matching Heuristic
        if filters.cuisine:
            cuisine_lower = filters.cuisine.lower()
            title = str(row.get("title", "")).lower()
            desc = str(row.get("description", "")).lower()
            # If not in title or description, check ingredients list
            if cuisine_lower not in title and cuisine_lower not in desc:
                if not any(cuisine_lower in ing for ing in ingredients_list):
                    return False
                    
        # 6. Healthy Filter (High protein, low fat, low sodium)
        if filters.healthy:
            if not row.get("nutrition_available"):
                return False
            protein = row.get("protein_pdv")
            fat = row.get("total_fat_pdv")
            sodium = row.get("sodium_pdv")
            if pd.isna(protein) or pd.isna(fat) or pd.isna(sodium):
                return False
            # Standard criteria: protein >= 10% DV, total fat <= 15% DV, sodium <= 20% DV
            if protein < 10.0 or fat > 15.0 or sodium > 20.0:
                return False
                
        return True

    def build_recipe_response(
        self, 
        row: pd.Series, 
        similarity_score: Optional[float] = None,
        ranker_score: Optional[float] = None,
        explanation: Optional[str] = None
    ) -> RecipeResponse:
        """Helper to cast DataFrame row to Pydantic RecipeResponse model."""
        r_id = row.get("id")
        int_id = int(r_id) if pd.notna(r_id) else None
        
        # Look up cooking minutes
        cooking_time = 30  # Default fallback
        if int_id is not None and int_id in app_state.recipe_id_to_minutes:
            cooking_time = app_state.recipe_id_to_minutes[int_id]
            
        ingredients = list(row.get("ingredients", []))
        instructions = list(row.get("instructions", []))
        
        return RecipeResponse(
            id=int_id,
            title=str(row.get("title", "")).title(),
            ingredients=ingredients,
            instructions=instructions,
            description=str(row.get("description", "")),
            source=str(row.get("source", "food.com")),
            nutrition_available=bool(row.get("nutrition_available", False)),
            calories=float(row.get("calories")) if pd.notna(row.get("calories")) else None,
            total_fat_pdv=float(row.get("total_fat_pdv")) if pd.notna(row.get("total_fat_pdv")) else None,
            sugar_pdv=float(row.get("sugar_pdv")) if pd.notna(row.get("sugar_pdv")) else None,
            sodium_pdv=float(row.get("sodium_pdv")) if pd.notna(row.get("sodium_pdv")) else None,
            protein_pdv=float(row.get("protein_pdv")) if pd.notna(row.get("protein_pdv")) else None,
            sat_fat_pdv=float(row.get("sat_fat_pdv")) if pd.notna(row.get("sat_fat_pdv")) else None,
            carbs_pdv=float(row.get("carbs_pdv")) if pd.notna(row.get("carbs_pdv")) else None,
            similarity_score=similarity_score,
            ranker_score=ranker_score,
            explanation=explanation,
            cooking_time_mins=cooking_time
        )

    def recommend_by_popularity(self, top_n: int = 10, filters: Optional[FilterParams] = None) -> List[RecipeResponse]:
        """Cold-start fallback: recommends based on Bayesian-adjusted popularity stats."""
        pop_ids = app_state.popularity_stats.sort_values("popularity_score", ascending=False).index.tolist()
        
        results = []
        for r_id in pop_ids:
            if len(results) >= top_n:
                break
            if r_id not in app_state.id_to_embedding_idx:
                continue
            idx = app_state.id_to_embedding_idx[r_id]
            row = app_state.df.iloc[idx]
            
            if self.matches_filters(row, r_id, filters):
                pop_score = app_state.popularity_stats.loc[r_id, "popularity_score"]
                explanation = f"Recommended because it is highly popular on Food.com (popularity index: {pop_score:.2f}/5.0)."
                results.append(self.build_recipe_response(row, ranker_score=pop_score, explanation=explanation))
                
        return results

    def recommend_by_similarity(self, recipe_id: int, top_n: int = 10, filters: Optional[FilterParams] = None) -> List[RecipeResponse]:
        """Content-based similarity: queries FAISS using a precomputed embedding of an existing recipe."""
        if recipe_id not in app_state.id_to_embedding_idx:
            raise ValueError(f"Recipe ID {recipe_id} not found in database catalog.")
            
        ref_idx = app_state.id_to_embedding_idx[recipe_id]
        query_vec = app_state.embeddings[ref_idx:ref_idx+1]
        
        # Search FAISS (increase candidate size to allow filtering room)
        candidate_size = max(200, top_n * 10)
        distances, indices = app_state.faiss_index.search(query_vec, candidate_size)
        
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if len(results) >= top_n:
                break
            if idx == ref_idx:  # Skip self
                continue
                
            row = app_state.df.iloc[idx]
            r_id = row.get("id")
            int_id = int(r_id) if pd.notna(r_id) else None
            
            if self.matches_filters(row, int_id, filters):
                explanation = f"Recommended because it has a {dist:.1%} semantic ingredient and step match with your active recipe."
                results.append(self.build_recipe_response(row, similarity_score=float(dist), explanation=explanation))
                
        return results

    def recommend_by_text(self, query: str, top_n: int = 10, filters: Optional[FilterParams] = None) -> List[RecipeResponse]:
        """Free-text query search: lazily loads SBERT, encodes query, and runs a FAISS index match."""
        # Check if the query is a recipe title in the dataset
        matches = app_state.df[app_state.df["title"].str.contains(query.lower(), na=False)]
        if not matches.empty:
            ref_idx = matches.index[0]
            query_vec = app_state.embeddings[ref_idx:ref_idx+1]
        else:
            # Lazy load SBERT for text encoding
            sbert = app_state.get_sbert_model()
            query_vec = sbert.encode([query.lower()], normalize_embeddings=True, convert_to_numpy=True)
            
        candidate_size = max(200, top_n * 10)
        distances, indices = app_state.faiss_index.search(query_vec, candidate_size)
        
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if len(results) >= top_n:
                break
            row = app_state.df.iloc[idx]
            r_id = row.get("id")
            int_id = int(r_id) if pd.notna(r_id) else None
            
            if self.matches_filters(row, int_id, filters):
                explanation = f"Recommended because it matches your text search query with a {dist:.1%} semantic alignment score."
                results.append(self.build_recipe_response(row, similarity_score=float(dist), explanation=explanation))
                
        return results

    def recommend_hybrid(self, user_id: int, top_n: int = 10, filters: Optional[FilterParams] = None) -> List[RecipeResponse]:
        """Learned Hybrid Ranking: Retrieves content neighbors, scores via SVD and Popularity, and ranks via Logistic Regression."""
        # Check if this user exists in our interactions profile lookup
        ref_recipe_id = app_state.user_top_recipe.get(user_id)
        if ref_recipe_id is None or ref_recipe_id not in app_state.id_to_embedding_idx:
            # Cold-start user
            print(f"Cold-start user profile detected for ID {user_id}. Falling back to popular recipes.")
            return self.recommend_by_popularity(top_n, filters)
            
        ref_idx = app_state.id_to_embedding_idx[ref_recipe_id]
        ref_title = app_state.recipe_id_to_title.get(ref_recipe_id, "your favorite recipe")
        query_vec = app_state.embeddings[ref_idx:ref_idx+1]
        
        # Step 1: Content Retrieval stage (e.g. top-100 candidates)
        candidate_pool_size = 150
        distances, indices = app_state.faiss_index.search(query_vec, candidate_pool_size)
        
        candidates = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx == ref_idx:
                continue
            row = app_state.df.iloc[idx]
            
            # Apply filters early to optimize SVD rating prediction loops
            r_id = row.get("id")
            int_id = int(r_id) if pd.notna(r_id) else None
            
            if not self.matches_filters(row, int_id, filters):
                continue
                
            # Step 2: Feature Engineering (Content similarity, SVD collaborative, Bayesian popularity)
            content_score = float(dist)
            
            # SVD Collaborative Filtering
            if row.get("source") != "food.com" or int_id is None:
                svd_score = app_state.global_mean_rating
                pop_score = app_state.global_mean_rating
            else:
                svd_score = float(app_state.svd_model.predict(user_id, int_id).est)
                if int_id in app_state.popularity_stats.index:
                    pop_score = float(app_state.popularity_stats.loc[int_id, "popularity_score"])
                else:
                    pop_score = app_state.global_mean_rating
                    
            # Step 3: Run the trained Logistic Regression model
            features = np.array([[content_score, svd_score, pop_score]])
            ranker_score = float(app_state.ranker_model.predict_proba(features)[0, 1])
            
            # Create a rich explanation
            explanation = (
                f"Personalized: combines a {content_score:.1%} content alignment to '{ref_title.title()}', "
                f"a predicted rating of {svd_score:.2f}/5.0 based on your taste profile, and "
                f"a community popularity rating of {pop_score:.2f}/5.0."
            )
            
            candidates.append({
                "row": row,
                "ranker_score": ranker_score,
                "content_score": content_score,
                "explanation": explanation
            })
            
        # Step 4: Sort candidates by logistic score
        candidates.sort(key=lambda x: x["ranker_score"], reverse=True)
        
        # Step 5: Format response
        results = []
        for cand in candidates[:top_n]:
            results.append(
                self.build_recipe_response(
                    cand["row"], 
                    similarity_score=cand["content_score"],
                    ranker_score=cand["ranker_score"],
                    explanation=cand["explanation"]
                )
            )
            
        # If filters were too aggressive and left us with fewer than top_n, fill remaining space using popularity
        if len(results) < top_n:
            pop_fill = self.recommend_by_popularity(top_n * 2, filters)
            existing_titles = {r.title.lower() for r in results}
            for recipe in pop_fill:
                if len(results) >= top_n:
                    break
                if recipe.title.lower() not in existing_titles:
                    results.append(recipe)
                    
        return results

recommender = RecommenderSystem()
