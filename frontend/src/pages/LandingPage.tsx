import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  ArrowRight, 
  Search, 
  Sparkles, 
  Database, 
  Binary, 
  SlidersHorizontal,
  Flame,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { api } from '../api';
import type { RecipeResponse } from '../types';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [typedQuery, setTypedQuery] = useState('');
  const [demoRecipes, setDemoRecipes] = useState<RecipeResponse[]>([]);
  const [demoState, setDemoState] = useState<'typing' | 'loading' | 'done'>('typing');

  // Load sample recipes for search demo preview
  useEffect(() => {
    api.getSampleRecipes()
      .then(res => setDemoRecipes(res.slice(0, 3)))
      .catch(() => {});
  }, []);

  // Typewriter search simulation
  useEffect(() => {
    const queryList = ['ch', 'chi', 'chic', 'chick', 'chicke', 'chicken', 'chicken ', 'chicken c', 'chicken cu', 'chicken cur', 'chicken curr', 'chicken curry', 'chicken curry with', 'chicken curry with r', 'chicken curry with ri', 'chicken curry with ric', 'chicken curry with rice'];
    let idx = 0;
    
    const typingInterval = setInterval(() => {
      if (idx < queryList.length) {
        setTypedQuery(queryList[idx]);
        idx++;
      } else {
        clearInterval(typingInterval);
        setDemoState('loading');
        
        // Mock a 1-second API latency load before showing results
        setTimeout(() => {
          setDemoState('done');
        }, 1200);
      }
    }, 90);

    return () => clearInterval(typingInterval);
  }, []);

  // Viewport scroll animated references
  const [pipelineRef, pipelineInView] = useInView({ threshold: 0.15, triggerOnce: true });
  const [statsRef, statsInView] = useInView({ threshold: 0.15, triggerOnce: true });

  const pipelineNodes = [
    { title: 'User Query', desc: 'Natural language keyword, title, or ingredient list entered by the user.', icon: Search },
    { title: 'Cleaning & Prep', desc: 'Tokenizing text fields, filtering strings, and preparing unified columns.', icon: SlidersHorizontal },
    { title: 'SBERT Vector Encoding', desc: 'MiniLM-L6 model encodes combined text into a 384-dimensional dense float vector.', icon: Binary },
    { title: 'FAISS Index Query', desc: 'Exact dot-product search calculates top-50 cosine similarities instantaneously.', icon: Database },
    { title: 'Hybrid Scoring & Ranking', desc: 'Learned Logistic Regression ranks by content similarity, SVD collaborative ratings, and Bayesian popularity.', icon: Sparkles },
    { title: 'Recommended Outputs', desc: 'Top-K recommendations mapped to structured templates showing explainability statistics.', icon: CheckCircle2 },
  ];

  return (
    <div className="w-full pb-20 overflow-x-hidden">
      {/* 1. Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-[85vh] px-8 text-center pt-24 pb-16">
        {/* Subtle background food outline graphic/parallax blur */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40 z-0" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-blue-100/40 blur-3xl z-0" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="relative z-10 space-y-6 max-w-4xl"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-600 border border-blue-100">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Next-Gen Culinary Intelligence
          </span>

          <h2 className="font-sans font-extrabold text-4xl sm:text-6xl tracking-tight text-slate-800 leading-[1.08] my-0">
            Find the perfect recipe<br />
            using <span className="text-blue-600 font-medium">semantic AI search</span>
          </h2>
          
          <p className="text-base sm:text-lg font-medium text-slate-500 max-w-2xl mx-auto leading-relaxed">
            A state-of-the-art recommendation engine leveraging Sentence-BERT embeddings, FAISS proximity calculations, and collaborative filtering to deliver personalized taste matches.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/recommendations')}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              Start Searching Recipes
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('pipeline');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm cursor-pointer"
            >
              Explore AI Architecture
            </button>
          </div>
        </motion.div>
      </section>

      {/* 2. Interactive Search Demo Section */}
      <section className="px-8 max-w-5xl mx-auto mb-28 relative">
        <div className="rounded-2xl border border-slate-200/80 bg-white/70 backdrop-blur-md p-8 shadow-xl">
          <div className="flex h-12 w-full items-center gap-3.5 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-slate-500">
            <Search className="h-5 w-5 shrink-0 text-slate-400" />
            <span className="font-semibold text-slate-700 font-sans tracking-wide text-sm">{typedQuery}</span>
            <span className="h-5 w-0.5 bg-blue-600 animate-pulse shrink-0" />
          </div>

          {/* Typing Search Results Demonstration */}
          <div className="mt-8">
            {demoState === 'typing' && (
              <div className="py-12 text-center text-slate-400 text-sm font-semibold">
                Simulating search parameters...
              </div>
            )}
            
            {demoState === 'loading' && (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="h-6 w-6 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin" />
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Running Proximity Calculations</span>
              </div>
            )}

            {demoState === 'done' && (
              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.15 }
                  }
                }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-6"
              >
                {demoRecipes.map((recipe, index) => (
                  <motion.div
                    key={index}
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      show: { opacity: 1, y: 0 }
                    }}
                    className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 text-left shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={() => navigate('/recommendations')}
                  >
                    <div className="h-28 w-full rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center text-blue-500 mb-4 font-bold text-xs uppercase tracking-widest border border-slate-100">
                      Recipe Preview
                    </div>
                    <h3 className="font-bold text-slate-800 text-base line-clamp-1 my-0 font-sans tracking-tight capitalize">
                      {recipe.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                      {recipe.source.toLowerCase() === 'food.com' ? 'Food.com Partner' : 'RecipeNLG'}
                    </p>
                    
                    <div className="flex gap-4 mt-4 text-[11px] font-bold text-slate-500 border-t border-slate-50 pt-3 leading-none">
                      <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-amber-500" /> {recipe.calories ? Math.round(recipe.calories) : '150'} kcal</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-slate-400" /> {recipe.cooking_time_mins || 30} mins</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Dataset Overview Section */}
      <section ref={statsRef} className="px-8 max-w-5xl mx-auto mb-28">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-10">Database Catalog Scale</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { label: 'Cleaned Recipes', value: '75,915 Recipes', desc: 'Unified cross-source dataset deduped by title schema.', barWidth: '95%', color: 'bg-blue-600' },
            { label: 'Embedding Vector Spaces', value: '384 Dimensions', desc: 'MiniLM-L6 dense embeddings maps semantic proximity.', barWidth: '85%', color: 'bg-emerald-500' },
            { label: 'Nutrition Disclosures', value: '65.0% Coverage', desc: 'Exact calories, carbs, protein, and fat values mapped.', barWidth: '65%', color: 'bg-amber-500' }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="flex flex-col text-left rounded-xl border border-slate-100 bg-white p-6 shadow-sm hover:border-slate-200 transition-colors"
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
              <span className="text-2xl font-black text-slate-800 mt-2 font-sans tracking-tight leading-none">{stat.value}</span>
              <p className="text-xs font-medium text-slate-500 mt-2.5 leading-relaxed flex-1">
                {stat.desc}
              </p>
              <div className="h-2 w-full bg-slate-100 rounded-full mt-5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={statsInView ? { width: stat.barWidth } : { width: 0 }}
                  transition={{ duration: 1, ease: 'easeOut', delay: idx * 0.15 + 0.2 }}
                  className={`h-full ${stat.color} rounded-full`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Scroll Pipeline Animation Section */}
      <section id="pipeline" ref={pipelineRef} className="px-8 max-w-4xl mx-auto mb-28">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Architectural Walkthrough</span>
          <h2 className="font-sans font-extrabold text-2xl md:text-3xl text-slate-800 tracking-tight mt-3 mb-0">
            End-to-End AI Data Pathway
          </h2>
          <p className="text-xs font-medium text-slate-400 mt-2 max-w-md mx-auto">
            Logical pipeline processing vectors and collaborative profiles.
          </p>
        </div>

        {/* Vertical Pipeline timeline */}
        <div className="relative border-l border-slate-200/80 ml-4 md:ml-12 space-y-12">
          {pipelineNodes.map((node, index) => {
            const Icon = node.icon;
            return (
              <motion.div
                key={index}
                animate={pipelineInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.6, delay: index * 0.12 }}
                className="relative pl-8 md:pl-12 group text-left"
              >
                {/* Visual node pin on line */}
                <div className="absolute left-[-17px] top-0.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-200 bg-white group-hover:border-blue-600 group-hover:bg-blue-50 transition-colors z-10">
                  <Icon className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 text-lg my-0 font-sans tracking-tight">
                    {node.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-2xl">
                    {node.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
