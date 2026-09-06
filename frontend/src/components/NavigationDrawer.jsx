import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Building2, 
  Activity, 
  Cpu, 
  Database, 
  Network, 
  Presentation, 
  Settings, 
  Sun, 
  Moon, 
  Contrast, 
  ChevronRight, 
  MapPin, 
  ShieldCheck, 
  Wifi, 
  CheckCircle2,
  Lock,
  Terminal,
  Home,
  FileText,
  Sparkles
} from 'lucide-react';

export default function NavigationDrawer({ 
  isOpen, 
  onClose, 
  activeTab, 
  setActiveTab, 
  theme, 
  setTheme,
  isDevMode = false,
  onLockDevMode,
  onOpenDevLogin,
  clinicalView = 'landing',
  setClinicalView
}) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className={`fixed inset-0 z-[999999] overflow-hidden no-print theme-${theme}`}>
      {/* Backdrop Dim & Blur Overlay */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md drawer-fade-in transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-Over Drawer Container (Slides smoothly from the right) */}
      <aside 
        className="fixed inset-y-0 right-0 max-w-md w-full sm:w-[460px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-[1000000] overflow-y-auto drawer-slide-in"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation & Operations Center"
      >
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center space-x-2.5">
            <span className="font-bold text-slate-100 text-sm tracking-tight">
              Navigation &amp; Operations Center
            </span>
            <span className="inline-flex items-center space-x-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Edge Live</span>
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Close Menu (Esc)"
            aria-label="Close Menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* AT TOP: PROFILE OF THE CENTER (Item 1)                                    */}
        {/* ========================================================================= */}
        <div className="p-4 bg-gradient-to-b from-cyan-950/30 via-slate-900 to-slate-900 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 flex items-center space-x-1.5">
              <Building2 className="h-3.5 w-3.5" />
              <span>Primary Health Center Profile</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center space-x-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              <span>NPCB Certified</span>
            </span>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 space-y-2.5 shadow-inner">
            <div>
              <h3 className="font-bold text-slate-100 text-sm leading-snug">
                PHC Block 4 &bull; Ratnagiri District Hospital
              </h3>
              <p className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                <MapPin className="h-3 w-3 text-cyan-400 shrink-0" />
                <span>Konkan Division, Maharashtra &bull; PIN: 415612</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/70 text-[11px]">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-mono">Center ID / MRN Prefix</span>
                <span className="font-mono font-bold text-slate-200">NPCB-MH-RTG-042</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-mono">Attending Clinician</span>
                <span className="font-medium text-slate-200">Dr. S. Sharma, MD</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-mono">Telemedicine District Link</span>
                <span className="font-medium text-indigo-300">Solapur Medical College Hub</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-mono">Edge Compute Node</span>
                <span className="font-medium text-cyan-300 font-mono">NVIDIA Orin Nano #882</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="flex items-center space-x-1 text-emerald-400">
                <Wifi className="h-3 w-3" />
                <span>Rural Uplink: 250 Kbps (Stable)</span>
              </span>
              <span>Payload: 3.2 KB Telemetry</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ITEMS 2, 3, 4, 5, 6: IMPORTANT CLINICAL & EVALUATION WORKSPACES           */}
        {/* ========================================================================= */}
        <div className="p-4 space-y-3 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
            Clinical Workspaces &amp; Advanced Modules
          </div>

          <div className="space-y-2">
            {!isDevMode ? (
              <>
                {/* 1. Patient Diagnostic Screening */}
                <button
                  onClick={() => {
                    if (setClinicalView) setClinicalView('screening');
                    onClose();
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between group ${
                    clinicalView === 'screening'
                      ? 'bg-slate-800 text-cyan-400 border-cyan-500/50 shadow-sm ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-lg ${clinicalView === 'screening' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400 group-hover:text-cyan-400'}`}>
                      <Activity className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100 flex items-center space-x-1.5">
                        <span>Patient Diagnostic Screening</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">Live</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Demographics intake, Gate 0 filter &amp; AI Staging</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 2. Clinical Portal Overview */}
                <button
                  onClick={() => {
                    if (setClinicalView) setClinicalView('landing');
                    onClose();
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between group ${
                    clinicalView === 'landing'
                      ? 'bg-slate-800 text-cyan-400 border-cyan-500/50 shadow-sm ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-lg ${clinicalView === 'landing' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400 group-hover:text-cyan-400'}`}>
                      <Home className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100 flex items-center space-x-1.5">
                        <span>Clinical Portal Home</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">DR pathology info, clinic guidelines &amp; protocol</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Restricted Developer Suite Trigger */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenDevLogin) onOpenDevLogin();
                    }}
                    className="w-full p-3 rounded-xl border border-amber-500/30 bg-amber-950/20 hover:bg-amber-950/40 text-left transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
                        <Lock className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-amber-200 flex items-center space-x-1.5">
                          <span>Developer Operations Console</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">Protected</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Enter passcode to unlock SGD, Benchmarks &amp; SimEvents</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-amber-400/60 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Dev Mode Active Status Bar */}
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between text-xs my-1">
                  <div className="flex items-center space-x-2 text-emerald-300">
                    <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="font-mono font-bold text-[11px]">DEV MODE ACTIVE</span>
                  </div>
                  {onLockDevMode && (
                    <button
                      onClick={onLockDevMode}
                      className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center space-x-1"
                      title="Lock developer panels"
                    >
                      <Lock className="h-3 w-3 text-amber-400" />
                      <span>Lock</span>
                    </button>
                  )}
                </div>

                {/* 2. Clinical Screening Pipeline */}
                <button
                  onClick={() => { setActiveTab('pipeline'); onClose(); }}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between group ${
                    activeTab === 'pipeline'
                      ? 'bg-slate-800 text-cyan-400 border-cyan-500/50 shadow-sm ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-lg ${activeTab === 'pipeline' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400 group-hover:text-cyan-400'}`}>
                      <Activity className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100 flex items-center space-x-1.5">
                        <span>Clinical Screening Pipeline</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">Mod 1-4</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">IQA, Multi-Lesion Masks, ETDRS 4-2-1 Staging &amp; Report</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 3. Real-Time Training Studio */}
                <button
                  onClick={() => { setActiveTab('training'); onClose(); }}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between group ${
                    activeTab === 'training'
                      ? 'bg-slate-800 text-cyan-400 border-cyan-500/50 shadow-sm ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-lg ${activeTab === 'training' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400 group-hover:text-cyan-400'}`}>
                      <Cpu className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100 flex items-center space-x-1.5">
                        <span>Real-Time Training Studio</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">Live SGD</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Real-time loss telemetry, weight adjustment &amp; matrix</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 4. 11 Clinical Benchmarks */}
                <button
                  onClick={() => { setActiveTab('benchmarks'); onClose(); }}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between group ${
                    activeTab === 'benchmarks'
                      ? 'bg-slate-800 text-cyan-400 border-cyan-500/50 shadow-sm ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-lg ${activeTab === 'benchmarks' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400 group-hover:text-emerald-400'}`}>
                      <Database className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100 flex items-center space-x-1.5">
                        <span>11 Clinical Benchmarks</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">24.4k Img</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">APTOS, IDRiD, Messidor-2, EyePACS multi-cohorts</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 5. Network Simulator */}
                <button
                  onClick={() => { setActiveTab('telemed'); onClose(); }}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between group ${
                    activeTab === 'telemed'
                      ? 'bg-slate-800 text-cyan-400 border-cyan-500/50 shadow-sm ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-lg ${activeTab === 'telemed' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400 group-hover:text-indigo-400'}`}>
                      <Network className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100 flex items-center space-x-1.5">
                        <span>Network Simulator</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">SimEvents</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Discrete-event 3.2 KB queuing &amp; link bottleneck test</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 6. Pitch Deck */}
                <button
                  onClick={() => { setActiveTab('pitch'); onClose(); }}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between group ${
                    activeTab === 'pitch'
                      ? 'bg-slate-800 text-cyan-400 border-cyan-500/50 shadow-sm ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-lg ${activeTab === 'pitch' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-400 group-hover:text-purple-400'}`}>
                      <Presentation className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-100 flex items-center space-x-1.5">
                        <span>SIH Pitch Deck</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">12 Slides</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">SIH 2026 Grand Finale submission blueprint</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Return to Clinical Daily Frontend option */}
                <div className="pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      if (onLockDevMode) onLockDevMode();
                      if (setClinicalView) setClinicalView('landing');
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-left transition-all flex items-center justify-between text-xs text-slate-400 hover:text-slate-200"
                  >
                    <span className="flex items-center space-x-2">
                      <Home className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Return to Clinical Daily Frontend</span>
                    </span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* AT LAST: SETTINGS & PREFERENCES (Theme switcher, Calibration & More)      */}
        {/* ========================================================================= */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 space-y-3 mt-auto">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Settings className="h-3.5 w-3.5 text-cyan-400" />
              <span>Settings &amp; Theme Preferences</span>
            </span>
            <button
              onClick={() => { setActiveTab('settings'); onClose(); }}
              className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 underline flex items-center space-x-1"
            >
              <span>Full Settings View</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {/* Theme Selector directly in Drawer */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span className="font-medium">Active Theme Palette</span>
              <span className="font-mono text-cyan-400 capitalize">{theme} Mode</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {[
                { id: 'slate', label: 'Dark Slate', icon: Moon },
                { id: 'white', label: 'White', icon: Sun },
                { id: 'black', label: 'OLED Black', icon: Contrast },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-[10px]">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* System Footer Note */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Sunetra AI v2.4</span>
            <span className="text-emerald-400/80 flex items-center space-x-1">
              <ShieldCheck className="h-3 w-3" />
              <span>MATLAB Core Intact</span>
            </span>
          </div>
        </div>

      </aside>
    </div>,
    document.body
  );
}
