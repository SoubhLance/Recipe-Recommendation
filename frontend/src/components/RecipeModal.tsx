import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Clock, 
  Flame, 
  Beef, 
  Sparkles, 
  Check, 
  BookOpen
} from 'lucide-react';
import type { RecipeResponse } from '../types';

interface RecipeModalProps {
  recipe: RecipeResponse;
  onClose: () => void;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, onClose }) => {
  // Local state to track which ingredients are checked off
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  const toggleIngredient = (ing: string) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [ing]: !prev[ing]
    }));
  };

  const getSourceDisplay = (source: string) => {
    return source.toLowerCase() === 'food.com' ? 'Food.com Partner' : 'RecipeNLG Dataset';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark overlay backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Dialog Content */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1.0] }}
        className="relative z-50 flex flex-col w-full max-w-4xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100"
      >
        {/* Close Button Header */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/20 text-white backdrop-blur-md hover:bg-slate-900/40 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Hero Visual Banner (Subtle soft gradient) */}
        <div className="relative flex flex-col justify-end h-52 bg-gradient-to-r from-blue-600/90 to-cyan-600/90 p-8 text-white">
          <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1543083503-0c4059a539c5?q=80&w=1200')" }} />
          <div className="relative z-10 space-y-2 text-left">
            <span className="inline-flex rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              {getSourceDisplay(recipe.source)}
            </span>
            <h2 className="font-sans font-extrabold text-2xl md:text-3xl tracking-tight leading-tight my-0">
              {recipe.title}
            </h2>
            <p className="text-sm font-medium text-white/80 line-clamp-1 max-w-2xl italic">
              {recipe.description || "A delicious curated recipe, prepped to culinary perfection."}
            </p>
          </div>
        </div>

        {/* Body content scroll region */}
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Metrics & Ingredients Checklists */}
          <div className="md:col-span-1 space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-center">
                <Clock className="h-5 w-5 text-slate-400 mb-1" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cooking Time</span>
                <span className="text-base font-bold text-slate-800 mt-1">{recipe.cooking_time_mins || 30} mins</span>
              </div>
              
              <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-center">
                <Flame className="h-5 w-5 text-amber-500 mb-1" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Calories</span>
                <span className="text-base font-bold text-slate-800 mt-1">
                  {recipe.calories !== null && recipe.calories !== undefined ? `${Math.round(recipe.calories)} cal` : 'N/A'}
                </span>
              </div>
            </div>

            {/* Detailed Nutrition Bars */}
            {recipe.nutrition_available && (
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mt-0 mb-1">
                  <Beef className="h-3.5 w-3.5" /> Nutrition Summary (% Daily Value)
                </h4>
                <div className="space-y-2">
                  {[
                    { name: 'Protein', val: recipe.protein_pdv, color: 'bg-emerald-500' },
                    { name: 'Total Fat', val: recipe.total_fat_pdv, color: 'bg-amber-500' },
                    { name: 'Carbs', val: recipe.carbs_pdv, color: 'bg-blue-500' },
                    { name: 'Sodium', val: recipe.sodium_pdv, color: 'bg-slate-400' }
                  ].map((nut) => (
                    <div key={nut.name} className="flex flex-col text-[11px] font-medium leading-none">
                      <div className="flex justify-between mb-1 font-semibold text-slate-600">
                        <span>{nut.name}</span>
                        <span>{nut.val !== null && nut.val !== undefined ? `${Math.round(nut.val)}%` : '0%'}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200/70 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${nut.color} rounded-full`}
                          style={{ width: `${Math.min(100, nut.val ?? 0)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients checklist */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mt-0 mb-2">
                Ingredients Checkbox
              </h4>
              <div className="space-y-2 text-left">
                {recipe.ingredients.map((ing) => {
                  const isChecked = !!checkedIngredients[ing];
                  return (
                    <button
                      key={ing}
                      onClick={() => toggleIngredient(ing)}
                      className={`flex w-full items-start gap-2.5 rounded-lg border px-3 py-2 text-left text-xs font-medium cursor-pointer transition-all ${
                        isChecked 
                          ? 'border-blue-200 bg-blue-50/20 text-blue-600' 
                          : 'border-slate-100 hover:bg-slate-50 text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border mt-0.5 transition-all ${
                        isChecked 
                          ? 'border-blue-600 bg-blue-600 text-white' 
                          : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && <Check className="h-2.5 w-2.5" />}
                      </div>
                      <span className={`leading-relaxed capitalize ${isChecked ? 'line-through opacity-70' : ''}`}>
                        {ing}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Columns: Instructions Cards & ML Explainability */}
          <div className="md:col-span-2 space-y-6 text-left">
            {/* Explainability Explanation Box (AI Insights) */}
            {(recipe.similarity_score || recipe.ranker_score || recipe.explanation) && (
              <div className="rounded-xl border border-blue-100 bg-blue-50/15 p-5 space-y-3">
                <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1.5 mt-0 mb-1">
                  <Sparkles className="h-3.5 w-3.5" /> Recommendation Explainability
                </h4>
                
                {/* Explain String */}
                {recipe.explanation && (
                  <p className="text-xs font-medium text-slate-600 leading-relaxed bg-white border border-slate-100/70 p-3 rounded-lg shadow-sm">
                    {recipe.explanation}
                  </p>
                )}

                {/* Score Progress indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {/* Similarity metric */}
                  {recipe.similarity_score !== undefined && recipe.similarity_score !== null && (
                    <div className="flex flex-col text-[11px] font-semibold text-slate-500 bg-white/50 border border-slate-100 rounded-lg p-2.5">
                      <span className="text-[10px] text-slate-400">Content Cosine similarity</span>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-bold text-slate-800 text-sm leading-none">{(recipe.similarity_score * 100).toFixed(1)}%</span>
                        <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600" style={{ width: `${recipe.similarity_score * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ranker relevance probability */}
                  {recipe.ranker_score !== undefined && recipe.ranker_score !== null && (
                    <div className="flex flex-col text-[11px] font-semibold text-slate-500 bg-white/50 border border-slate-100 rounded-lg p-2.5">
                      <span className="text-[10px] text-slate-400">Hybrid Ranker Score</span>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-bold text-slate-800 text-sm leading-none">{(recipe.ranker_score * 100).toFixed(1)}%</span>
                        <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${recipe.ranker_score * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Instruction Steps */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mt-0 mb-2">
                <BookOpen className="h-4.5 w-4.5 text-slate-400" /> Structured Steps
              </h4>
              <div className="space-y-3">
                {recipe.instructions.map((step, idx) => (
                  <div 
                    key={idx}
                    className="flex gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:border-slate-200 transition-colors"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                      {idx + 1}
                    </div>
                    <p className="text-xs font-medium text-slate-700 leading-relaxed capitalize">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
