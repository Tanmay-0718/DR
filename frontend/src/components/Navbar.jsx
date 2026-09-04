import React from 'react';
import { 
  Eye, 
  Activity, 
  Network, 
  Database, 
  Presentation, 
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenQA }) {
  const tabs = [
    { id: 'pipeline', label: 'Diagnostic Pipeline', icon: Activity, badge: 'Mod 1-4' },
    { id: 'telemed', label: 'Network Simulator', icon: Network, badge: 'SimEvents' },
    { id: 'benchmarks', label: 'Benchmarks', icon: Database, badge: '4 Datasets' },
    { id: 'pitch', label: 'Pitch Deck', icon: Presentation, badge: '12 Slides' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('pipeline')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-100 tracking-tight text-lg">
                  RETINA-NET <span className="text-cyan-400 font-mono text-sm uppercase">AI</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  SIH 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Rural Tele-Ophthalmology Screening • Edge + SimEvents
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="hidden md:inline">{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono hidden lg:inline ${
                    isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Right Action: Judge Q&A Drawer */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenQA}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-colors shadow-sm"
              title="Open Technical Defense & MathWorks Mapping"
            >
              <HelpCircle className="h-4 w-4 text-indigo-400" />
              <span className="hidden sm:inline">Judge Q&A</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
