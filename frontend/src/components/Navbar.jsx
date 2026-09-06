import React from 'react';
import { 
  Eye, 
  Menu,
  Lock,
  Unlock,
  Terminal,
  Activity,
  ArrowRight,
  Cloud
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  isMenuOpen, 
  setIsMenuOpen,
  isDevMode = false,
  onLockDevMode,
  onOpenDevLogin,
  clinicalView = 'landing',
  setClinicalView
}) {
  const handleLogoClick = () => {
    if (isDevMode) {
      setActiveTab('pipeline');
    } else {
      if (setClinicalView) setClinicalView('landing');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name: Sunetra */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={handleLogoClick}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-100 tracking-tight text-lg">
                  Sunetra
                </span>
                {isDevMode && (
                  <span className="hidden md:inline-flex items-center space-x-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                    <Terminal className="h-2.5 w-2.5" />
                    <span>Dev Console</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Autonomous Retinal Tele-Ophthalmology Portal &bull; Edge AI
              </p>
            </div>
          </div>

          {/* Right Actions: Dev Status & Menu */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* Dev Mode Active Status & Switcher */}
            {isDevMode && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (onLockDevMode) onLockDevMode();
                  }}
                  className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all"
                  title="Lock developer console and return to clinical view"
                >
                  <Lock className="h-3.5 w-3.5 text-amber-400" />
                  <span>Lock Dev</span>
                </button>
              </div>
            )}

            {/* Central Cloud Registry Quick Access */}
            <button
              onClick={() => {
                if (isDevMode) {
                  setActiveTab('registry');
                } else if (setClinicalView) {
                  setClinicalView('registry');
                }
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                (!isDevMode && clinicalView === 'registry') || (isDevMode && activeTab === 'registry')
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm ring-1 ring-cyan-500/30'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
              }`}
              title="Open Central Cloud Patient Registry (Search across centers)"
            >
              <Cloud className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Cloud Registry</span>
            </button>

            {/* Edge Online Badge */}
            <div className="hidden sm:flex items-center space-x-2 font-mono text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-lg shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Edge Online</span>
            </div>

            {/* 3-Line Hamburger Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              title="Open Operations Menu"
              aria-label="Open Operations Menu"
              className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
                isMenuOpen
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 ring-2 ring-cyan-500/30'
                  : 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 shadow-sm'
              }`}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
