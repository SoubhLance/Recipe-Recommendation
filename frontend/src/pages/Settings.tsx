import React, { useState } from 'react';
import { 
  User, 
  Wifi, 
  Database,
  CheckCircle2
} from 'lucide-react';
import { api } from '../api';
import type { UserProfile, HealthResponse } from '../types';

interface SettingsProps {
  activeUser: UserProfile | null;
  setActiveUser: (user: UserProfile) => void;
  sampleUsers: UserProfile[];
  health: HealthResponse | null;
  refetchHealth: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  activeUser,
  setActiveUser,
  sampleUsers,
  health,
  refetchHealth
}) => {
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [testingLatency, setTestingLatency] = useState(false);

  // Test Connection Latency
  const testLatency = async () => {
    setTestingLatency(true);
    const start = performance.now();
    try {
      await api.getHealth();
      const duration = performance.now() - start;
      setLatencyMs(Math.round(duration));
    } catch (e) {
      setLatencyMs(null);
    } finally {
      setTestingLatency(false);
      refetchHealth();
    }
  };

  return (
    <div className="w-full min-h-[90vh] px-8 py-8 flex flex-col gap-8 text-left">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-6 space-y-1.5">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Control Center</span>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight my-0 font-sans">
          Dashboard Settings
        </h2>
        <p className="text-xs font-medium text-slate-500 max-w-xl leading-relaxed my-0">
          Configure test user profiles, run connection diagnostics, and view active machine learning architectures.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Active User Selector */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider my-0">Demo User Profile Selector</h3>
            <p className="text-xs font-medium text-slate-400 mt-1.5 leading-relaxed my-0">
              Select an active Food.com reviewer profile. Switching profiles updates the collaborative filtering (SVD) and hybrid ranking predictions instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sampleUsers.map((user) => {
              const isSelected = activeUser?.user_id === user.user_id;
              return (
                <button
                  key={user.user_id}
                  onClick={() => setActiveUser(user)}
                  className={`flex flex-col text-left rounded-xl border p-5 cursor-pointer transition-all duration-300 relative ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50/15 shadow-sm ring-1 ring-blue-500' 
                      : 'border-slate-200/80 bg-white hover:bg-slate-50/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2">
                      <User className={`h-4.5 w-4.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold text-slate-800">User #{user.user_id}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="h-4.5 w-4.5 text-blue-600 shrink-0" />}
                  </div>
                  
                  <div className="mt-3.5 border-t border-slate-100 pt-3 flex flex-col min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Favorite Recipe</span>
                    <span className={`text-xs font-bold truncate mt-1.5 capitalize ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                      {user.favorite_recipe_title}
                    </span>
                    <span className="text-[10px] text-slate-400 leading-none mt-1">Anchor ID: {user.favorite_recipe_id}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Connection & Diagnostic parameters */}
        <div className="md:col-span-1 space-y-6">
          {/* Connection Test */}
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider my-0">Diagnostics</h3>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-5 space-y-5 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-700">API Gateway Connectivity</span>
              <Wifi className={`h-4.5 w-4.5 ${health ? 'text-emerald-500' : 'text-amber-500'}`} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase">Response Latency</span>
                <span className="font-sans font-black text-slate-800 text-lg mt-1">
                  {latencyMs !== null ? `${latencyMs} ms` : 'Not Tested'}
                </span>
              </div>

              <button
                onClick={testLatency}
                disabled={testingLatency}
                className="rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {testingLatency ? 'Pinging...' : 'Test Latency'}
              </button>
            </div>

            {/* Health Info blocks */}
            {health && (
              <div className="border-t border-slate-100 pt-4 space-y-2 text-xs font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-400">SBERT Cache:</span>
                  <span className="font-bold text-slate-700">{health.sbert_cached ? 'Initialized' : 'Lazy'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Uptime:</span>
                  <span className="font-bold text-slate-700">{health.uptime_seconds} seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Memory usage:</span>
                  <span className="font-bold text-slate-700">{health.memory_usage_mb} MB</span>
                </div>
              </div>
            )}
          </div>

          {/* Model information specs */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mt-0 mb-1">
              <Database className="h-4 w-4 text-slate-400" /> Active Catalog Manifest
            </h4>
            <div className="space-y-2.5 text-xs font-medium">
              <div className="flex justify-between">
                <span className="text-slate-400">Dataset Version:</span>
                <span className="font-bold text-slate-700">v1.2-merged</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Embedding vector:</span>
                <span className="font-bold text-slate-700">all-MiniLM-L6-v2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Search Index:</span>
                <span className="font-bold text-slate-700">FAISS IndexFlatIP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
