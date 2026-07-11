import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search as SearchIcon, 
  Sparkles, 
  Flame, 
  Clock, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  X,
  FileText,
  Check
} from 'lucide-react';
import { api } from '../api';
import type { RecipeResponse, FilterParams, UserProfile } from '../types';
import { RecipeModal } from '../components/RecipeModal';

interface RecommendationsProps {
  activeUser: UserProfile | null;
}

export const Recommendations: React.FC<RecommendationsProps> = ({ activeUser }) => {
  // Search parameters
  const [searchMode, setSearchMode] = useState<'content' | 'hybrid'>('content');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRecipeId, setActiveRecipeId] = useState<number | null>(null);
  const [activeRecipeTitle, setActiveRecipeTitle] = useState<string | null>(null);

  // Filters state
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [maxCalories, setMaxCalories] = useState<number>(1000);
  const [maxTime, setMaxTime] = useState<number>(120);
  const [vegetarian, setVegetarian] = useState(false);
  const [vegan, setVegan] = useState(false);
  const [healthy, setHealthy] = useState(false);
  const [cuisine, setCuisine] = useState('');

  // Selected recipe detail modal state
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeResponse | null>(null);

  // API query via React Query
  const buildRequestParams = () => {
    const filterParams: FilterParams = {
      max_calories: maxCalories,
      max_time_mins: maxTime,
      vegetarian: vegetarian ? true : null,
      vegan: vegan ? true : null,
      healthy: healthy ? true : null,
      cuisine: cuisine.trim() ? cuisine : null,
    };

    if (searchMode === 'hybrid') {
      return {
        mode: 'hybrid' as const,
        user_id: activeUser?.user_id || 424680, // Fallback to first user in list
        filters: filterParams,
        top_n: 12
      };
    } else {
      return {
        mode: 'content' as const,
        recipe_id: activeRecipeId || undefined,
        query: searchQuery.trim() ? searchQuery : 'Curry', // Fallback search query
        filters: filterParams,
        top_n: 12
      };
    }
  };

  const { data: recipes, isLoading, isError, refetch } = useQuery<RecipeResponse[]>({
    queryKey: ['recommendations', searchMode, searchQuery, activeRecipeId, maxCalories, maxTime, vegetarian, vegan, healthy, cuisine, activeUser?.user_id],
    queryFn: () => api.getRecommendations(buildRequestParams()),
    retry: 2,
  });

  const recipesList = (recipes || []) as RecipeResponse[];

  const handleRecipeAnchor = (id: number, title: string) => {
    setActiveRecipeId(id);
    setActiveRecipeTitle(title);
    setSearchMode('content');
  };

  const clearAnchor = () => {
    setActiveRecipeId(null);
    setActiveRecipeTitle(null);
    setSearchQuery('');
  };

  return (
    <div className="flex flex-col w-full min-h-[90vh] px-8 py-8 relative">
      {/* Top Header Mode Toggle Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-6">
        <div className="text-left space-y-1.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Catalog Exploration</span>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight my-0 font-sans">
            {searchMode === 'hybrid' 
              ? `Personalized Hybrid Recommendations` 
              : `Semantic AI Recipe Search`
            }
          </h2>
          <p className="text-xs font-medium text-slate-500 max-w-xl leading-relaxed my-0">
            {searchMode === 'hybrid'
              ? `Reordering top content similarities based SVD predicted ratings for user #${activeUser?.user_id || 424680}.`
              : `Exact nearest neighbor similarity lookup over Sentence-BERT generated embedding spaces.`
            }
          </p>
        </div>

        {/* Toggle Mode Buttons */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-slate-200/60 border border-slate-200 shadow-inner shrink-0">
          <button
            onClick={() => {
              setSearchMode('content');
              clearAnchor();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              searchMode === 'content'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Semantic Search
          </button>
          <button
            onClick={() => setSearchMode('hybrid')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              searchMode === 'hybrid'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Personalized Hybrid
          </button>
        </div>
      </div>

      {/* Main Search Panel & Filter Bar */}
      <div className="flex flex-col gap-6 mt-6">
        <div className="flex flex-wrap items-center gap-4">
          {searchMode === 'content' && (
            <>
              {activeRecipeId ? (
                /* Anchor similarity indicator lock */
                <div className="flex items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50/20 px-4 py-2.5 text-xs font-bold text-blue-600 shadow-sm">
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate max-w-xs capitalize">Locked: {activeRecipeTitle}</span>
                  <button onClick={clearAnchor} className="h-4 w-4 text-blue-400 hover:text-blue-600 transition-colors cursor-pointer">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                /* Active text search input */
                <div className="flex-1 min-w-[280px] flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-slate-500 shadow-sm hover:border-slate-300 focus-within:border-blue-600 transition-colors">
                  <SearchIcon className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by keywords, ingredients (e.g. pasta, tomato), or natural language query..."
                    className="w-full text-xs font-semibold text-slate-700 bg-transparent border-0 outline-0 placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="h-4 w-4 text-slate-400 hover:text-slate-600 cursor-pointer">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {searchMode === 'hybrid' && activeUser && (
            <div className="flex-grow flex items-center gap-2 border border-slate-100 rounded-xl bg-slate-50/60 p-3 text-xs font-semibold text-slate-600">
              <Sparkles className="h-4 w-4 text-blue-500 shrink-0" />
              <span>
                Personalizing using <strong className="text-slate-700">User #{activeUser.user_id}</strong>'s history item: 
                <strong className="text-blue-600 italic uppercase ml-1">"{activeUser.favorite_recipe_title}"</strong>
              </span>
            </div>
          )}

          {/* Collapsible Filters Toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex h-11 items-center gap-2 rounded-xl border px-4 text-xs font-bold transition-all shadow-sm cursor-pointer ${
              filtersOpen 
                ? 'border-blue-600 bg-blue-50/30 text-blue-600' 
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Filters Panel dropdown card */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border border-slate-200/80 bg-white rounded-xl shadow-sm text-left"
            >
              <div className="p-6 grid grid-cols-1 sm:grid-cols-4 gap-6">
                {/* Max Calories slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-500 leading-none">
                    <span>Max Calories</span>
                    <span className="text-slate-800">{maxCalories} kcal</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="50"
                    value={maxCalories}
                    onChange={(e) => setMaxCalories(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Max cooking time slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-500 leading-none">
                    <span>Max Cooking Time</span>
                    <span className="text-slate-800">{maxTime} mins</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="180"
                    step="5"
                    value={maxTime}
                    onChange={(e) => setMaxTime(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Cuisine Filter Text */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 block leading-none">Cuisine Category</span>
                  <input
                    type="text"
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    placeholder="e.g. Italian, Indian, French..."
                    className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 outline-0 focus:border-blue-600 transition-colors"
                  />
                </div>

                {/* Dietary checkboxes */}
                <div className="flex flex-col gap-3 justify-center">
                  {[
                    { label: 'Vegetarian', val: vegetarian, setVal: setVegetarian },
                    { label: 'Vegan', val: vegan, setVal: setVegan },
                    { label: 'Healthy Choice', val: healthy, setVal: setHealthy }
                  ].map((chk) => (
                    <button
                      key={chk.label}
                      onClick={() => chk.setVal(!chk.val)}
                      className="flex items-center gap-2 text-left cursor-pointer group"
                    >
                      <div className={`flex h-4.5 w-4.5 items-center justify-center rounded border transition-all ${
                        chk.val 
                          ? 'border-blue-600 bg-blue-600 text-white' 
                          : 'border-slate-300 bg-white group-hover:border-slate-400'
                      }`}>
                        {chk.val && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors">{chk.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grid Content List */}
      <div className="mt-8 flex-1">
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col rounded-2xl border border-slate-100 bg-white p-5 space-y-4 shadow-sm animate-pulse">
                <div className="h-32 w-full rounded-xl bg-slate-100" />
                <div className="h-4 w-2/3 rounded bg-slate-100" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
                <div className="h-8 w-full rounded-lg bg-slate-100 mt-4" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="py-24 text-center space-y-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 font-bold text-lg">!</span>
            <h3 className="text-lg font-black text-slate-800 my-0">Connection Failed</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">Could not fetch recommendations. Ensure the FastAPI server is running on port 8000.</p>
            <button onClick={() => refetch()} className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer">Retry</button>
          </div>
        )}

        {!isLoading && !isError && recipesList.length === 0 && (
          <div className="py-24 text-center space-y-3 border border-dashed border-slate-200 rounded-2xl">
            <h3 className="text-base font-black text-slate-800 my-0">No Recipes Found</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">Try loosening your nutrition sliders, cuisine inputs, or keywords to query a larger candidate pool.</p>
          </div>
        )}

        {!isLoading && !isError && recipesList.length > 0 && (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.05 }
              }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
          >
            {recipesList.map((recipe: RecipeResponse, index: number) => {
              const displayScore = recipe.ranker_score !== undefined && recipe.ranker_score !== null
                ? recipe.ranker_score
                : recipe.similarity_score;

              return (
                <motion.div
                  key={recipe.id || index}
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    show: { opacity: 1, y: 0 }
                  }}
                  className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm hover:-translate-y-1 hover:shadow-md hover:border-slate-200 transition-all duration-300 relative group"
                >
                  <div>
                    {/* Header Score badge */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {recipe.source.toLowerCase() === 'food.com' ? 'Food.com' : 'RecipeNLG'}
                      </span>
                      {displayScore !== undefined && displayScore !== null && (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          recipe.ranker_score !== null 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}>
                          {recipe.ranker_score !== null ? 'Hybrid ' : 'Match '}
                          {Math.round(displayScore * 100)}%
                        </span>
                      )}
                    </div>

                    {/* Image visual placeholder */}
                    <div className="h-32 w-full rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
                      <TrendingUp className="h-6 w-6 text-slate-200 group-hover:text-blue-500/30 group-hover:scale-110 transition-all duration-300" />
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-1 my-0 font-sans tracking-tight capitalize">
                      {recipe.title}
                    </h3>
                    
                    {/* Description preview */}
                    <p className="text-xs font-medium text-slate-400 line-clamp-2 mt-2 leading-relaxed h-8">
                      {recipe.description || 'A delicious, healthy recipe structured to perfection.'}
                    </p>
                  </div>

                  <div>
                    {/* Metrics row */}
                    <div className="flex gap-4 mt-4 text-[10px] font-bold text-slate-500 border-t border-slate-50 pt-3.5 leading-none">
                      <span className="flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5 text-amber-500" /> 
                        {recipe.calories ? `${Math.round(recipe.calories)} kcal` : 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" /> 
                        {recipe.cooking_time_mins || 30} mins
                      </span>
                    </div>

                    {/* Action button */}
                    <button
                      onClick={() => setSelectedRecipe(recipe)}
                      className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all shadow-sm cursor-pointer"
                    >
                      <span>View Recipe</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                    
                    {/* Recipe similarity lock quick-action */}
                    {recipe.id && (
                      <button
                        onClick={() => handleRecipeAnchor(recipe.id!, recipe.title)}
                        className="mt-2 text-[10px] font-bold text-blue-600/80 hover:text-blue-600 block text-center w-full transition-colors cursor-pointer"
                      >
                        Find Similar Recipes
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Detail Overlay Modal */}
      <AnimatePresence>
        {selectedRecipe && (
          <RecipeModal
            recipe={selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
