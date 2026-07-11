import axios from 'axios';
import type { RecommendRequest, RecipeResponse, StatsResponse, HealthResponse, UserProfile } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  getHealth: async (): Promise<HealthResponse> => {
    const { data } = await apiClient.get<HealthResponse>('/health');
    return data;
  },

  getStats: async (): Promise<StatsResponse> => {
    const { data } = await apiClient.get<StatsResponse>('/stats');
    return data;
  },

  getSampleRecipes: async (): Promise<RecipeResponse[]> => {
    const { data } = await apiClient.get<RecipeResponse[]>('/recipes/sample');
    return data;
  },

  getSampleUsers: async (): Promise<UserProfile[]> => {
    const { data } = await apiClient.get<UserProfile[]>('/users/sample');
    return data;
  },

  getRecipeDetails: async (recipeId: number): Promise<RecipeResponse> => {
    const { data } = await apiClient.get<RecipeResponse>(`/recipes/${recipeId}`);
    return data;
  },

  getRecommendations: async (request: RecommendRequest): Promise<RecipeResponse[]> => {
    const { data } = await apiClient.post<RecipeResponse[]>('/recommend', request);
    return data;
  },
};
