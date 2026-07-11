import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { Recommendations } from './pages/Recommendations';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { api } from './api';
import type { UserProfile, HealthResponse } from './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes caching
    },
  },
});

const AppContent: React.FC = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Unified app-level state
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [sampleUsers, setSampleUsers] = useState<UserProfile[]>([]);
  const [health, setHealth] = useState<HealthResponse | null>(null);

  // Load sample users and set default profile
  useEffect(() => {
    api.getSampleUsers()
      .then((users) => {
        setSampleUsers(users);
        if (users.length > 0) {
          setActiveUser(users[0]);
        }
      })
      .catch((err) => console.error("Could not load sample users:", err));
  }, []);

  // Query health checks on mount and periodically
  const fetchHealth = () => {
    api.getHealth()
      .then((res) => setHealth(res))
      .catch(() => setHealth(null));
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 6000);
    return () => clearInterval(interval);
  }, []);

  // Determine active route title for Navbar display
  const getPageTitle = (path: string) => {
    switch (path) {
      case '/':
        return 'Overview';
      case '/recommendations':
        return 'Recommendations';
      case '/analytics':
        return 'Analytics & Evaluation';
      case '/settings':
        return 'Settings';
      default:
        return 'Recipe Recommendation Dashboard';
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        activeUser={activeUser}
      />

      {/* Main Content Layout Wrapper */}
      <div 
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ paddingLeft: isCollapsed ? 72 : 240 }}
      >
        {/* Top Navbar */}
        <Navbar 
          pageTitle={getPageTitle(location.pathname)}
          activeUser={activeUser}
          setActiveUser={setActiveUser}
          sampleUsers={sampleUsers}
          health={health}
        />

        {/* Inner Route Panels */}
        <main className="flex-1 w-full bg-slate-50/50">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/recommendations" element={<Recommendations activeUser={activeUser} />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings activeUser={activeUser} setActiveUser={setActiveUser} sampleUsers={sampleUsers} health={health} refetchHealth={fetchHealth} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
};

export default App;
