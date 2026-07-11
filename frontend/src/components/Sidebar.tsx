import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Search, 
  BarChart3, 
  Settings as SettingsIcon, 
  ChevronLeft, 
  ChevronRight, 
  ChefHat,
  User
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  activeUser: { user_id: number; favorite_recipe_title: string } | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed, activeUser }) => {
  const menuItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Recommendations', path: '/recommendations', icon: Search },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <motion.div
      animate={{ width: isCollapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-slate-200/80 bg-white shadow-sm"
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <ChefHat className="h-5 w-5" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-sans font-bold text-lg text-slate-800 tracking-tight whitespace-nowrap"
              >
                Recipe<span className="text-blue-600 font-medium">AI</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        
        {!isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(true)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1.5 px-3 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3.5 rounded-lg px-3.5 py-3 text-sm font-medium transition-all group relative ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="whitespace-nowrap font-medium"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Active Indicator Pin */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute right-0 top-1/4 bottom-1/4 w-1 rounded-l-full bg-blue-600"
                    />
                  )}

                  {/* Collapsed Tooltip */}
                  {isCollapsed && (
                    <div className="absolute left-16 hidden group-hover:block rounded bg-slate-900 px-2 py-1 text-xs font-semibold text-white shadow-md z-50 whitespace-nowrap">
                      {item.name}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle Trigger (when collapsed) */}
      {isCollapsed && (
        <div className="flex justify-center p-3 border-t border-slate-100">
          <button 
            onClick={() => setIsCollapsed(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Active User Switcher Indicator Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 overflow-hidden rounded-lg p-2 hover:bg-slate-100/70 transition-all cursor-pointer">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
            <User className="h-4.5 w-4.5" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col text-left overflow-hidden min-w-0"
              >
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Profile</span>
                <span className="text-sm font-bold text-slate-700 truncate">
                  {activeUser ? `User #${activeUser.user_id}` : 'Guest User'}
                </span>
                <span className="text-xs font-medium text-slate-400 truncate">
                  {activeUser ? activeUser.favorite_recipe_title : 'No History'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
