import React from 'react';
import { 
  Eye, 
  Menu
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isMenuOpen, setIsMenuOpen }) {
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
                  Chakshuh <span className="text-cyan-400 font-mono text-sm uppercase">AI</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Rural Tele-Ophthalmology Screening • Edge + SimEvents
              </p>
            </div>
          </div>

          {/* Right Actions: Status Badge & 3-Line Hamburger Menu Icon */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* Status Badge */}
            <div className="hidden sm:flex items-center space-x-2 font-mono text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-lg shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Edge Online</span>
            </div>

            {/* 3-Line Hamburger Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              title="Open Navigation Menu & Center Profile"
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
