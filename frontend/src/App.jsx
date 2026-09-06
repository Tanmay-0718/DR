import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PipelineDemo from './components/PipelineDemo';
import SettingsView from './components/SettingsView';
import NavigationDrawer from './components/NavigationDrawer';
import ErrorBoundary from './components/ErrorBoundary';
import ClinicalEntranceAnimation from './components/ClinicalEntranceAnimation';
import ClinicalLandingView from './components/ClinicalLandingView';
import ClinicalScreeningWorkflow from './components/ClinicalScreeningWorkflow';
import CloudPatientRegistry from './components/CloudPatientRegistry';
import DeveloperUnlockModal from './components/DeveloperUnlockModal';
import { ShieldCheck, HeartPulse, Terminal, Lock, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('pipeline');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [clinicalView, setClinicalView] = useState('landing'); // 'landing' | 'screening'
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);

  // Entrance animation state (plays once per session, with replay option)
  const [hasSeenAnimation, setHasSeenAnimation] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('sunetra_anim_seen') === 'true';
    }
    return false;
  });

  // Developer mode state (gated behind passcode DR071104-A)
  const [isDevMode, setIsDevMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('retina_dev_mode') === 'true';
    }
    return false;
  });

  const handleAnimationComplete = () => {
    setHasSeenAnimation(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('sunetra_anim_seen', 'true');
    }
  };

  const handleReplayIntro = () => {
    setHasSeenAnimation(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('sunetra_anim_seen');
    }
  };

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

  // If user hasn't seen entrance animation yet, show the full 4-phase cinematic entrance
  if (!hasSeenAnimation) {
    return <ClinicalEntranceAnimation onComplete={handleAnimationComplete} />;
  }

  return (
    <div className={`min-h-screen theme-${theme} bg-slate-950 text-slate-100 flex flex-col font-sans subtle-grid selection:bg-cyan-500/20 selection:text-cyan-200 transition-colors duration-200 relative`}>
      {/* Top Navbar */}
      <div className={`no-print transition-all duration-300 ${isMenuOpen ? 'filter blur-sm pointer-events-none' : ''}`}>
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          isDevMode={isDevMode}
          onLockDevMode={handleLockDevMode}
          onOpenDevLogin={() => setIsDevModalOpen(true)}
          clinicalView={clinicalView}
          setClinicalView={setClinicalView}
        />
      </div>

      {/* Main View Area & Footer (Blurred & Unusable when drawer is open) */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isMenuOpen ? 'filter blur-md pointer-events-none select-none opacity-40' : ''
      }`}>
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 print:p-0 print:m-0 print:max-w-none">
          <ErrorBoundary>
            {/* GATED LOGIC: Standard Clinical Frontend vs Dev Engineering Layout */}
            {!isDevMode ? (
              /* DAILY CLINICAL USER FRONTEND */
              activeTab === 'settings' ? (
                <SettingsView 
                  theme={theme} 
                  setTheme={setTheme} 
                  activeSubTab="general"
                  setActiveSubTab={(tab) => setActiveTab(tab)}
                  onReturnToPipeline={() => {
                    setActiveTab('pipeline');
                  }}
                  isDevMode={isDevMode}
                  onUnlockDevMode={handleUnlockDevMode}
                  onLockDevMode={handleLockDevMode}
                />
              ) : clinicalView === 'registry' ? (
                <CloudPatientRegistry 
                  onNavigateToScreening={() => setClinicalView('screening')}
                />
              ) : clinicalView === 'landing' ? (
                <ClinicalLandingView 
                  onStartScreening={() => setClinicalView('screening')}
                  onOpenRegistry={() => setClinicalView('registry')}
                />
              ) : (
                <ClinicalScreeningWorkflow 
                  onBackToLanding={() => setClinicalView('landing')}
                  onOpenRegistry={() => setClinicalView('registry')}
                />
              )
            ) : (
              /* RESTRICTED DEVELOPER & SUPPORT CONSOLE (Unlocked with DR071104-A) */
              <div className="space-y-6">
                {/* Developer Mode Banner */}
                <div className="p-3.5 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Terminal className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-emerald-200">Developer Operations Console Active</span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase">
                          Passcode Authorized
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Full access granted to Live SGD Training Studio, 11 Multi-Cohort Benchmarks, SimEvents Network Simulator &amp; SIH Deck.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        handleLockDevMode();
                        setClinicalView('landing');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
                    >
                      <Lock className="h-3.5 w-3.5 text-amber-400" />
                      <span>Lock &amp; Exit to Clinical View</span>
                    </button>
                  </div>
                </div>

                {/* Developer Subview */}
                {activeTab === 'pipeline' ? (
                  <PipelineDemo />
                ) : activeTab === 'registry' ? (
                  <CloudPatientRegistry 
                    onNavigateToScreening={() => setActiveTab('pipeline')}
                  />
                ) : (
                  <SettingsView 
                    theme={theme} 
                    setTheme={setTheme} 
                    activeSubTab={['training', 'benchmarks', 'telemed', 'pitch'].includes(activeTab) ? activeTab : 'general'}
                    setActiveSubTab={(tab) => setActiveTab(tab)}
                    onReturnToPipeline={() => setActiveTab('pipeline')}
                    isDevMode={isDevMode}
                    onUnlockDevMode={handleUnlockDevMode}
                    onLockDevMode={handleLockDevMode}
                  />
                )}
              </div>
            )}
          </ErrorBoundary>
        </main>

        {/* Footer */}
        <footer className="no-print border-t border-slate-900 bg-slate-950/90 text-xs text-slate-500 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <HeartPulse className="h-4 w-4 text-cyan-400" />
              <span className="font-semibold text-slate-300">
                Sunetra
              </span>
              <span className="text-slate-600 hidden sm:inline">&bull;</span>
              <span className="text-slate-400 hidden sm:inline">
                Autonomous Retinal Tele-Ophthalmology Screening System
              </span>
            </div>

            <div className="flex items-center space-x-4 font-mono text-[11px]">
              <button
                onClick={handleReplayIntro}
                className="text-slate-500 hover:text-cyan-400 flex items-center space-x-1 transition-colors"
                title="Replay 4-phase intro animation"
              >
                <Sparkles className="h-3 w-3" />
                <span>Replay Intro</span>
              </button>
              <span className="text-slate-700 hidden sm:inline">&bull;</span>
              <span className="text-emerald-400/80 flex items-center space-x-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Edge Node Online</span>
              </span>
              <span>v2.4 Production</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Developer Passcode Modal */}
      <DeveloperUnlockModal 
        isOpen={isDevModalOpen}
        onClose={() => setIsDevModalOpen(false)}
        onUnlock={handleUnlockDevMode}
      />

      {/* Slide-Over Navigation Drawer (Portaled to document.body) */}
      <NavigationDrawer 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        setTheme={setTheme}
        isDevMode={isDevMode}
        onLockDevMode={handleLockDevMode}
        onOpenDevLogin={() => setIsDevModalOpen(true)}
        clinicalView={clinicalView}
        setClinicalView={setClinicalView}
      />
    </div>
  );
}
