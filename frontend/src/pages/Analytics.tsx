import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { 
  Database, 
  Binary, 
  Apple, 
  GitCommit, 
  UserMinus,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { api } from '../api';
import type { StatsResponse } from '../types';

export const Analytics: React.FC = () => {
  const { data: stats, isLoading, isError } = useQuery<StatsResponse>({
    queryKey: ['stats'],
    queryFn: api.getStats,
    retry: 1,
  });

  // Format Recharts data from evaluation results
  const chartData = stats
    ? Object.entries(stats.eval_results).map(([name, hitRate]) => ({
        name: name.replace(' Model (SBERT+FAISS)', '').replace(' Heuristic', '').replace(' Collaborative Filtering', '').replace(' Ranker', ''),
        HitRate: parseFloat((hitRate * 100).toFixed(3)),
      })).sort((a, b) => a.HitRate - b.HitRate)
    : [];

  return (
    <div className="w-full min-h-[90vh] px-8 py-8 flex flex-col gap-8 text-left">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-6 space-y-1.5">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Diagnostic Insights</span>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight my-0 font-sans">
          Analytics & Evaluation
        </h2>
        <p className="text-xs font-medium text-slate-500 max-w-xl leading-relaxed my-0">
          Visualizing dataset properties, embedding space density, and end-to-end model evaluation Hit Rate@10 metrics.
        </p>
      </div>

      {isLoading && (
        <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
          <div className="h-6 w-6 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin" />
          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Loading Analytics Data</span>
        </div>
      )}

      {isError && (
        <div className="py-24 text-center space-y-3">
          <h3 className="text-base font-black text-slate-800 my-0">Connection Failed</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">Could not fetch statistics. Make sure the FastAPI server is running on port 8000.</p>
        </div>
      )}

      {!isLoading && !isError && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Visual Metrics Cards */}
          <div className="md:col-span-1 space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest my-0">System Performance Metrics</h3>
            
            {/* Metric Blocks */}
            <div className="space-y-4">
              {/* Dataset Size Card */}
              <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-2.5">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Dataset Size</span>
                  <Database className="h-4 w-4" />
                </div>
                <div className="font-sans font-black text-xl text-slate-800 tracking-tight">75,915 Recipes</div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '100%' }} />
                </div>
                <span className="text-[10px] font-semibold text-slate-400 block mt-1.5 leading-normal">
                  Merged & unified rows from Food.com and RecipeNLG.
                </span>
              </div>

              {/* Embedding space Card */}
              <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-2.5">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Embeddings</span>
                  <Binary className="h-4 w-4" />
                </div>
                <div className="font-sans font-black text-xl text-slate-800 tracking-tight">384 Dimensions</div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                </div>
                <span className="text-[10px] font-semibold text-slate-400 block mt-1.5 leading-normal">
                  Sentence-BERT (all-MiniLM-L6-v2) embedding length.
                </span>
              </div>

              {/* Nutrition Coverage Card */}
              <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-2.5">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Nutrition Coverage</span>
                  <Apple className="h-4 w-4" />
                </div>
                <div className="font-sans font-black text-xl text-slate-800 tracking-tight">65.0% of recipes</div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '65%' }} />
                </div>
                <span className="text-[10px] font-semibold text-slate-400 block mt-1.5 leading-normal">
                  Food.com rows have full nutrition values. RecipeNLG rows has NaN.
                </span>
              </div>

              {/* Sparsity Card */}
              <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-2.5">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Interaction Sparsity</span>
                  <GitCommit className="h-4 w-4" />
                </div>
                <div className="font-sans font-black text-xl text-slate-800 tracking-tight">99.9978% Sparse</div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: '99%' }} />
                </div>
                <span className="text-[10px] font-semibold text-slate-400 block mt-1.5 leading-normal">
                  1.13M ratings over 226k users & 231k recipes. Median 1.0 rating/user.
                </span>
              </div>

              {/* Cold Start Pct Card */}
              <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-2.5">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Cold Start Ratio</span>
                  <UserMinus className="h-4 w-4" />
                </div>
                <div className="font-sans font-black text-xl text-slate-800 tracking-tight">73.4% of Users</div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: '73.4%' }} />
                </div>
                <span className="text-[10px] font-semibold text-slate-400 block mt-1.5 leading-normal">
                  Users in interactions csv with only 1 rating total.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Chart & Explanations */}
          <div className="md:col-span-2 space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest my-0">Model Evaluation results</h3>
            
            {/* Chart Card */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-slate-700 leading-none">Hit Rate@10 Comparison</span>
                <span className="text-[11px] font-medium text-slate-400 mt-1.5 leading-none">
                  Measured via leave-one-out cross-validation split (2,000 held-out users)
                </span>
              </div>

              {/* Recharts Bar chart container */}
              <div className="h-80 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
                    <YAxis stroke="#94a3b8" tickLine={false} unit="%" />
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }}
                      labelStyle={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '4px' }}
                      itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                      formatter={(val) => [`${val}%`, 'Hit Rate@10']}
                    />
                    <Bar dataKey="HitRate" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Evaluation Interpretation */}
              <div className="rounded-xl border border-blue-50 bg-blue-50/10 p-5 space-y-2">
                <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1.5 mt-0 mb-1">
                  <Sparkles className="h-3.5 w-3.5" /> Quantitative Findings
                </h4>
                <p className="text-xs font-medium text-slate-500 leading-relaxed my-0">
                  The head-to-head leave-one-out evaluation reveals that the **Content-based model (SBERT + FAISS)** outperforms the collaborative filtering (SVD) and hybrid models on this corpus.
                </p>
                <p className="text-xs font-medium text-slate-500 leading-relaxed my-0">
                  Because the interaction density is extremely sparse (median ~1 rating/user), there is insufficient historical overlap for SVD to generalize well. Content similarity operates on semantic word vectors, which provides a significantly stronger ranking signal.
                </p>
              </div>
            </div>

            {/* Model Metadata Box */}
            <div className="rounded-xl border border-slate-100 bg-white p-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mt-0 mb-1">
                <BarChart3 className="h-4.5 w-4.5" /> Model Parameter Specifications
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="flex flex-col border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                  <span className="text-[10px] text-slate-400">Embedding Model</span>
                  <span className="text-slate-800 mt-1 font-bold">all-MiniLM-L6-v2</span>
                </div>
                <div className="flex flex-col border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                  <span className="text-[10px] text-slate-400">FAISS Index Class</span>
                  <span className="text-slate-800 mt-1 font-bold">faiss.IndexFlatIP</span>
                </div>
                <div className="flex flex-col border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                  <span className="text-[10px] text-slate-400">SVD Latent Factors</span>
                  <span className="text-slate-800 mt-1 font-bold">50 factors ( Surprise )</span>
                </div>
                <div className="flex flex-col border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                  <span className="text-[10px] text-slate-400">Hybrid Classifier</span>
                  <span className="text-slate-800 mt-1 font-bold">LogisticRegression (Balanced)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
