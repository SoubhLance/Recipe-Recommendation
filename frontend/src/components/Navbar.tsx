import React, { useState } from 'react';
import { User, Activity, AlertCircle, ChevronDown, Check } from 'lucide-react';
import type { UserProfile, HealthResponse } from '../types';

interface NavbarProps {
  pageTitle: string;
  activeUser: UserProfile | null;
  setActiveUser: (user: UserProfile) => void;
  sampleUsers: UserProfile[];
  health: HealthResponse | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  pageTitle,
  activeUser,
  setActiveUser,
  sampleUsers,
  health,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 right-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/70 px-8 backdrop-blur-md">
      {/* Title */}
      <h1 className="font-sans font-bold text-xl text-slate-800 tracking-tight leading-none my-0">
        {pageTitle}
      </h1>

      {/* Action items */}
      <div className="flex items-center gap-6">
        {/* Profile Dropdown Swapper */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm cursor-pointer"
          >
            <User className="h-3.5 w-3.5 text-slate-400" />
            <span>
              {activeUser ? `Profile: User #${activeUser.user_id}` : 'Guest Profile'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <>
              {/* Overlay Backdrop */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setDropdownOpen(false)}
              />
              
              <div className="absolute right-0 mt-2 w-64 rounded-lg border border-slate-200/80 bg-white p-1 shadow-lg z-50 animate-in fade-in-50 slide-in-from-top-1 duration-200">
                <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Switch User Profile</span>
                  <span className="text-[11px] text-slate-500 font-medium leading-relaxed block mt-0.5">
                    Testing collaborative SVD & hybrid predictions
                  </span>
                </div>
                
                <div className="max-h-60 overflow-y-auto">
                  {sampleUsers.map((user) => {
                    const isSelected = activeUser?.user_id === user.user_id;
                    return (
                      <button
                        key={user.user_id}
                        onClick={() => {
                          setActiveUser(user);
                          setDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded px-2.5 py-2 text-left text-xs font-medium cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="font-bold">User #{user.user_id}</span>
                          <span className="text-[10px] text-slate-400 truncate mt-0.5">
                            Pref: {user.favorite_recipe_title}
                          </span>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Backend Connection Diagnostics */}
        <div 
          className="group relative flex items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/60 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm"
        >
          {health ? (
            <>
              <Activity className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
              <span>API Online</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              
              {/* Tooltip detail hover card */}
              <div className="absolute right-0 top-10 hidden group-hover:block w-52 rounded-lg border border-slate-200 bg-white p-3 shadow-lg z-50 text-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1 mb-1.5">System Diagnostics</span>
                <div className="space-y-1.5 text-left text-[11px] font-medium leading-none">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">SBERT Cache:</span>
                    <span className="font-bold text-slate-700">{health.sbert_cached ? 'Active' : 'Lazy'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">RAM usage:</span>
                    <span className="font-bold text-slate-700">{health.memory_usage_mb} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Uptime:</span>
                    <span className="font-bold text-slate-700">{health.uptime_seconds}s</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
              <span>Connecting...</span>
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            </>
          )}
        </div>
      </div>
    </header>
  );
};
