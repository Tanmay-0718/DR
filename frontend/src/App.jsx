import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PipelineDemo from './components/PipelineDemo';
import SettingsView from './components/SettingsView';
import NavigationDrawer from './components/NavigationDrawer';
import ErrorBoundary from './components/ErrorBoundary';
import { ShieldCheck, HeartPulse, Terminal } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('pipeline');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDevMode, setIsDevMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('retina_dev_mode') === 'true';
    }
    return false;
  });

  const handleUnlockDevMode = (passcode) => {
    if (passcode && passcode.trim() === 'DR071104-A') {
      setIsDevMode(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('retina_dev_mode', 'true');
      }
      return true;
    }
    return false;
  };

  const handleLockDevMode = () => {
    setIsDevMode(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('retina_dev_mode');
    }
    if (['training', 'benchmarks', 'telemed', 'pitch'].includes(activeTab)) {
      setActiveTab('pipeline');
    }
  };

  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('retina_theme') || 'slate';
    }
    return 'slate';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('retina_theme', theme);
      const root = document.documentElement;
      root.classList.remove('theme-slate', 'theme-white', 'theme-black');
      root.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  return (
    <div className={`min-h-screen theme-${theme} bg-slate-950 text-slate-100 flex flex-col font-sans subtle-grid selection:bg-cyan-500/20 selection:text-cyan-200 transition-colors duration-200 relative`}>
      {/* Top Navbar */}
      <div className={`no-print transition-all duration-300 ${isMenuOpen ? 'filter blur-sm pointer-events-none' : ''}`}>
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
        />
      </div>

      {/* Main View Area & Footer (Blurred & Unusable when drawer is open) */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isMenuOpen ? 'filter blur-md pointer-events-none select-none opacity-40' : ''
      }`}>
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 print:p-0 print:m-0 print:max-w-none">
          <ErrorBoundary>
            {activeTab === 'pipeline' ? (
              <PipelineDemo />
            ) : (
              <SettingsView 
                theme={theme} 
                setTheme={setTheme} 
                activeSubTab={['training', 'benchmarks', 'telemed', 'pitch'].includes(activeTab) ? (isDevMode ? activeTab : 'general') : 'general'}
                setActiveSubTab={(tab) => setActiveTab(tab)}
                onReturnToPipeline={() => setActiveTab('pipeline')}
                isDevMode={isDevMode}
                onUnlockDevMode={handleUnlockDevMode}
                onLockDevMode={handleLockDevMode}
              />
            )}
          </ErrorBoundary>
        </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-900 bg-slate-950/90 text-xs text-slate-500 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <HeartPulse className="h-4 w-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">
              Chakshuh AI
            </span>
            <span className="text-slate-600 hidden sm:inline">&bull;</span>
            <span className="text-slate-400 hidden sm:inline">
              Rural Tele-Ophthalmology Screening Prototype
            </span>
          </div>

          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span className="text-emerald-400/80 flex items-center space-x-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>MATLAB Core Intact</span>
            </span>
            <span>Vercel Edge Ready</span>
          </div>
        </div>
      </footer>
      </div>

      {/* Slide-Over Navigation Drawer (Portaled to document.body) */}
      <NavigationDrawer 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        setTheme={setTheme}
        isDevMode={isDevMode}
        onUnlockDevMode={handleUnlockDevMode}
        onLockDevMode={handleLockDevMode}
      />
    </div>
  );
}
