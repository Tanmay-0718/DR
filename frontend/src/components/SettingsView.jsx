import React, { useState } from 'react';
import { 
  Settings, 
  Sun, 
  Moon, 
  Contrast, 
  Check, 
  ShieldCheck, 
  Cpu, 
  Wifi, 
  Database, 
  Sliders, 
  Eye, 
  EyeOff,
  Sparkles,
  CheckCircle2,
  Building2,
  Activity,
  Presentation,
  Network,
  ArrowLeft,
  ArrowRight,
  Zap,
  Layers,
  LineChart,
  Lock,
  Unlock,
  Key,
  Terminal,
  ShieldAlert
} from 'lucide-react';

// Import the panels now hosted within Settings
import RealtimeTrainingStudio from './RealtimeTrainingStudio';
import BenchmarkView from './BenchmarkView';
import NetworkSim from './NetworkSim';
import SlideDeck from './SlideDeck';

export default function SettingsView({ 
  theme, 
  setTheme, 
  activeSubTab = 'general', 
  setActiveSubTab,
  onReturnToPipeline,
  isDevMode = false,
  onUnlockDevMode,
  onLockDevMode
}) {
  const [internalSubTab, setInternalSubTab] = useState(activeSubTab || 'general');
  const currentSubTab = setActiveSubTab ? activeSubTab : internalSubTab;
  const setSubTab = setActiveSubTab || setInternalSubTab;

  const [telemetryMode, setTelemetryMode] = useState('structured');
  const [iqaThreshold, setIqaThreshold] = useState(45.0);
  const [defaultFacility, setDefaultFacility] = useState('PHC Block 4, Ratnagiri District Hospital');
  const [defaultClinician, setDefaultClinician] = useState('Dr. S. Sharma, MD (Tele-Ophthalmologist)');
  const [autoCache, setAutoCache] = useState(true);
  const [savedAlert, setSavedAlert] = useState(false);

  // DEV Mode Passcode state
  const [devPassword, setDevPassword] = useState('');
  const [devError, setDevError] = useState(false);
  const [devSuccessAlert, setDevSuccessAlert] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleDevUnlock = (e) => {
    if (e) e.preventDefault();
    if (onUnlockDevMode) {
      const ok = onUnlockDevMode(devPassword);
      if (ok) {
        setDevPassword('');
        setDevError(false);
        setDevSuccessAlert(true);
        setTimeout(() => setDevSuccessAlert(false), 3000);
      } else {
        setDevError(true);
      }
    } else if (devPassword.trim() === 'DR071104-A') {
      setDevPassword('');
      setDevError(false);
      setDevSuccessAlert(true);
      setTimeout(() => setDevSuccessAlert(false), 3000);
    } else {
      setDevError(true);
    }
  };

  const allTabs = [
    { id: 'general', label: 'Preferences & Themes', icon: Sliders, badge: null },
    { id: 'training', label: 'Real-Time Training', icon: Cpu, badge: 'Live SGD' },
    { id: 'benchmarks', label: '11 Benchmarks', icon: Database, badge: '24.4k Img' },
    { id: 'telemed', label: 'Network Simulator', icon: Network, badge: 'SimEvents' },
    { id: 'pitch', label: 'Pitch Deck', icon: Presentation, badge: '12 Slides' },
  ];

  const settingsTabs = isDevMode 
    ? allTabs 
    : [];

  const themeOptions = [
    {
      id: 'slate',
      name: 'Dark Slate',
      subtitle: 'Cyber-Clinical (Default)',
      icon: Moon,
      badge: 'Edge Triage',
      description: 'Engineered for low-glare telemedicine kiosks, edge screening cockpits, and dim mobile screening vans.',
      previewBg: 'bg-slate-950',
      previewCard: 'bg-slate-900',
      previewBorder: 'border-slate-800',
      previewAccent: 'bg-cyan-500',
      textColor: 'text-slate-100',
    },
    {
      id: 'white',
      name: 'Clinical White',
      subtitle: 'Hospital Paper / Daylight',
      icon: Sun,
      badge: 'OPD Daylight',
      description: 'Crisp, high-contrast light mode tailored for brightly lit outpatient clinics, consultation rooms, and print alignment.',
      previewBg: 'bg-slate-100',
      previewCard: 'bg-white',
      previewBorder: 'border-slate-300',
      previewAccent: 'bg-sky-600',
      textColor: 'text-slate-900',
    },
    {
      id: 'black',
      name: 'OLED Black',
      subtitle: 'Pure Darkroom / Pitch Black',
      icon: Contrast,
      badge: 'High Contrast',
      description: 'True pitch black (zero OLED pixel emission) for darkened fundus imaging booths and maximum battery savings.',
      previewBg: 'bg-black',
      previewCard: 'bg-zinc-950',
      previewBorder: 'border-zinc-800',
      previewAccent: 'bg-cyan-400',
      textColor: 'text-white',
    },
  ];

  const handleSaveDefaults = (e) => {
    e.preventDefault();
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Top Header & Sub-Navigation */}
      <div className="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="h-11 w-11 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-inner">
              <Settings className="h-5 w-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight">
                  Settings &amp; Preferences
                </h1>
                {isDevMode && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>DEV UNLOCKED</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isDevMode 
                  ? 'Manage themes, clinical thresholds, real-time training studio, benchmark datasets, network simulator, and pitch deck.'
                  : 'Configure clinic appearance, telemedicine telemetry sync, and default demographic details.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Quick Lock Button if Dev Mode is Active */}
            {isDevMode && onLockDevMode && (
              <button
                onClick={onLockDevMode}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition-all shadow-sm"
                title="Lock Developer Mode"
              >
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                <span>Lock Dev</span>
              </button>
            )}

            {/* Quick Return to Clinical Pipeline Button */}
            {onReturnToPipeline && (
              <button
                onClick={onReturnToPipeline}
                className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 transition-all shadow-sm"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>{isDevMode ? 'Back to Developer Pipeline' : 'Back to Clinical Portal'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-Navigation Pill Bar (Appears only when Dev Mode is Unlocked) */}
        {settingsTabs.length > 0 && (
          <div className="flex overflow-x-auto space-x-1.5 pt-2 border-t border-slate-800/80 scrollbar-none">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSubTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm ring-1 ring-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* VIEW 1: GENERAL PREFERENCES & THEMES */}
      {currentSubTab === 'general' && (
        <div className="space-y-8">
          {/* Quick-Launch Cards for Advanced Modules (Only available/visible in DEV mode) */}
          {isDevMode ? (
            <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                    <Layers className="h-4 w-4 text-cyan-400" />
                    <span>Advanced Evaluation &amp; Research Modules</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Direct access to edge training, validation benchmarks, discrete-event network simulation, and presentation slides.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>DEV MODE ACTIVE</span>
                  </span>
                  {onLockDevMode && (
                    <button
                      onClick={onLockDevMode}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                      title="Lock Developer Mode"
                    >
                      <Lock className="h-3.5 w-3.5 text-amber-400" />
                      <span>Lock</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                {/* Card 1: Real-Time Training Studio */}
                <div 
                  onClick={() => setSubTab('training')}
                  className="cursor-pointer bg-slate-900/80 hover:bg-slate-850 p-4 rounded-xl border border-slate-800 hover:border-cyan-500/50 transition-all group flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition-transform">
                      <Cpu className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      Live SGD
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      Real-Time Training Studio
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Interactive weight tuning, loss curve telemetry, and hyperparameter calibration.
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-cyan-400 font-semibold pt-1">
                    <span>Open Studio</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Card 2: 11 Benchmarks */}
                <div 
                  onClick={() => setSubTab('benchmarks')}
                  className="cursor-pointer bg-slate-900/80 hover:bg-slate-850 p-4 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-all group flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                      <Database className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      24.4k Images
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                      11 Clinical Benchmarks
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Cross-cohort validation across APTOS, IDRiD, Messidor-2, EyePACS, and Zenodo.
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-emerald-400 font-semibold pt-1">
                    <span>View Benchmarks</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Card 3: Network Simulator */}
                <div 
                  onClick={() => setSubTab('telemed')}
                  className="cursor-pointer bg-slate-900/80 hover:bg-slate-850 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-all group flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                      <Network className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      SimEvents
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                      Network Simulator
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Discrete-event rural telemetry queuing simulator &amp; uplink bottleneck modeling.
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-indigo-400 font-semibold pt-1">
                    <span>Simulate Network</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Card 4: Pitch Deck */}
                <div 
                  onClick={() => setSubTab('pitch')}
                  className="cursor-pointer bg-slate-900/80 hover:bg-slate-850 p-4 rounded-xl border border-slate-800 hover:border-purple-500/50 transition-all group flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform">
                      <Presentation className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      12 Slides
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                      SIH Pitch Deck
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Executive summary, problem statement, edge architecture, and clinical impact.
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-purple-400 font-semibold pt-1">
                    <span>Launch Presentation</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* SECTION: APPEARANCE & THEME */}
          <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <span>Display Theme &amp; Visual Personality</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select your preferred clinical workspace theme. Changes apply instantly and persist across sessions.
                </p>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                Active: {theme === 'slate' ? 'Dark Slate' : theme === 'white' ? 'Clinical White' : 'OLED Black'}
              </span>
            </div>

            {/* 3 Theme Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = theme === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setTheme(opt.id)}
                    className={`cursor-pointer rounded-xl p-4 border transition-all relative flex flex-col justify-between space-y-4 hover:shadow-lg ${
                      isActive
                        ? 'bg-slate-800/80 border-cyan-500 ring-2 ring-cyan-500/30 shadow-cyan-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    {/* Top Badge & Icon */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className={`p-2 rounded-lg ${
                          isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-100">{opt.name}</h3>
                          <p className="text-[11px] text-slate-400">{opt.subtitle}</p>
                        </div>
                      </div>

                      {isActive ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          <Check className="h-3 w-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-800/60 px-1.5 py-0.5 rounded">
                          {opt.badge}
                        </span>
                      )}
                    </div>

                    {/* Theme Palette Mini-Preview Box */}
                    <div className={`p-3 rounded-lg border ${opt.previewBorder} ${opt.previewBg} space-y-2 shadow-inner`}>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className={`${opt.textColor} font-semibold`}>Preview Sample</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      </div>
                      <div className={`p-2 rounded ${opt.previewCard} border ${opt.previewBorder} flex items-center justify-between`}>
                        <div className="flex items-center space-x-1.5">
                          <div className={`w-2.5 h-2.5 rounded-full ${opt.previewAccent}`}></div>
                          <span className={`text-[10px] font-medium ${opt.textColor}`}>Fundus Pipeline</span>
                        </div>
                        <span className="text-[9px] font-mono px-1 rounded bg-slate-500/20 text-slate-400">92%</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {opt.description}
                    </p>

                    {/* Select Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTheme(opt.id);
                      }}
                      className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
                        isActive
                          ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20 cursor-default'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-white" />
                          <span>Currently Enabled</span>
                        </>
                      ) : (
                        <span>Switch to {opt.name}</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION: CLINICAL ENGINE & ETDRS 4-2-1 CALIBRATION */}
          <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <Sliders className="h-4 w-4 text-emerald-400" />
                <span>Clinical Engine Calibration &amp; Quality Gates</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Parameters calibrated against ETDRS Standard Photographs 2A, 6B, 8A and MATLAB Edge Engine.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* IQA Quality Gate Sharpness Threshold */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-semibold flex items-center space-x-1.5">
                    <Eye className="h-4 w-4 text-cyan-400" />
                    <span>IQA Laplacian Sharpness Threshold</span>
                  </span>
                  <span className="font-mono font-bold text-cyan-300">{iqaThreshold.toFixed(1)}</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="70" 
                  step="2.5"
                  value={iqaThreshold}
                  onChange={(e) => setIqaThreshold(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>20.0 (Permissive)</span>
                  <span>45.0 (Standard)</span>
                  <span>70.0 (Strict Topcon)</span>
                </div>
              </div>

              {/* Telemedicine Sync Payload Mode */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-semibold flex items-center space-x-1.5">
                    <Wifi className="h-4 w-4 text-indigo-400" />
                    <span>Rural Telemedicine Sync Format</span>
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    {telemetryMode === 'structured' ? '3.2 KB Payload' : '15 MB Full Raw'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setTelemetryMode('structured')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-left ${
                      telemetryMode === 'structured'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold">Structured Telemetry</div>
                    <div className="text-[10px] text-slate-500">99.98% Bandwidth Cut</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTelemetryMode('raw')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-left ${
                      telemetryMode === 'raw'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold">Full DICOM Raw</div>
                    <div className="text-[10px] text-slate-500">Urban Fiber Only</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: DEFAULT CLINICAL PROFILE FOR PRINTABLE REPORTS */}
          <form onSubmit={handleSaveDefaults} className="bg-slate-900/40 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-sky-400" />
                <span>Default Clinical Demographics for Official Reports</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Auto-fills patient documentation and NPCB export documents generated in Module 4.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Default Screening Facility</label>
                <input
                  type="text"
                  value={defaultFacility}
                  onChange={(e) => setDefaultFacility(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
                  placeholder="Facility name"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Attending Clinician / Reviewing Specialist</label>
                <input
                  type="text"
                  value={defaultClinician}
                  onChange={(e) => setDefaultClinician(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
                  placeholder="Doctor name & credentials"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-300">
                <input 
                  type="checkbox" 
                  checked={autoCache} 
                  onChange={(e) => setAutoCache(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Enable Local Edge Offline Cache (auto-sync when link restored)</span>
              </label>

              <div className="flex items-center space-x-3">
                {savedAlert && (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Saved!</span>
                  </span>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-semibold rounded-lg text-xs shadow-md shadow-cyan-600/20 transition-all"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </form>

          {/* SECTION: SYSTEM INFO & SIH 2026 BENCHMARK BADGE */}
          <div className="bg-slate-950/80 rounded-xl border border-slate-800/80 p-4 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-400">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold text-slate-200 block">Smart India Hackathon 2026 &bull; Grand Finale Project</span>
                <span className="text-[11px] text-slate-500">Autonomous Diabetic Retinopathy Screening for Rural Telemedicine Networks</span>
              </div>
            </div>

            <div className="flex items-center space-x-4 font-mono text-[11px]">
              <span className="text-cyan-400">MATLAB Core R2024b</span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-indigo-400">SimEvents 18-d Fused</span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-emerald-400">100% Referable Sensitivity</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* AT THE VERY BOTTOM OF SETTINGS PAGE: DEVELOPER MODE & ENGINEERING ACCESS  */}
          {/* ========================================================================= */}
          {!isDevMode ? (
            <div className="bg-slate-950/90 rounded-2xl border border-slate-800/90 hover:border-slate-700 p-5 sm:p-6 space-y-4 shadow-xl transition-all">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-900 text-slate-400 border border-slate-800 shadow-inner">
                    <Terminal className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-slate-100">
                        Developer Mode &amp; Engineering Console
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700 font-semibold">
                        Passcode Protected
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Unlock experimental research modules: Real-Time Training Studio, 11 Clinical Benchmarks, Network Simulator, and SIH Pitch Deck.
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                  Authorization Required
                </span>
              </div>

              {/* Passcode Unlock Form */}
              <form onSubmit={handleDevUnlock} className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[240px]">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={devPassword}
                    onChange={(e) => { setDevPassword(e.target.value); setDevError(false); }}
                    placeholder="Enter Developer Passcode..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-semibold rounded-lg text-xs shadow-md shadow-cyan-600/20 transition-all flex items-center space-x-1.5"
                >
                  <Unlock className="h-3.5 w-3.5" />
                  <span>Unlock Developer Mode</span>
                </button>

                {devError && (
                  <div className="w-full text-xs text-rose-400 font-medium flex items-center space-x-1.5 pt-0.5">
                    <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                    <span>Invalid developer passcode. Authorization required.</span>
                  </div>
                )}

                {devSuccessAlert && (
                  <div className="w-full text-xs text-emerald-400 font-medium flex items-center space-x-1.5 pt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>Developer Mode Unlocked! Real-Time Training, 11 Benchmarks, Network Sim, and Pitch Deck are now accessible.</span>
                  </div>
                )}
              </form>
            </div>
          ) : (
            <div className="bg-slate-950/90 rounded-2xl border border-emerald-500/30 p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-inner">
                    <Terminal className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-slate-100">
                        Developer Mode Console
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>ACTIVE &bull; AUTHORIZED</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Root engineering privileges active. Training Studio, 11 Benchmarks, Network Sim, and Pitch Deck are unlocked.
                    </p>
                  </div>
                </div>

                {onLockDevMode && (
                  <button
                    onClick={onLockDevMode}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <Lock className="h-3.5 w-3.5 text-amber-400" />
                    <span>Lock / Exit Dev Mode</span>
                  </button>
                )}
              </div>

              {/* Quick-Launch buttons for the 4 unlocked modules */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <button
                  onClick={() => setSubTab('training')}
                  className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group"
                >
                  <div className="flex items-center space-x-2 text-cyan-400 mb-1">
                    <Cpu className="h-4 w-4" />
                    <span className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-300">Training Studio</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Live SGD weight tuning</div>
                </button>

                <button
                  onClick={() => setSubTab('benchmarks')}
                  className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group"
                >
                  <div className="flex items-center space-x-2 text-emerald-400 mb-1">
                    <Database className="h-4 w-4" />
                    <span className="text-[11px] font-bold text-slate-200 group-hover:text-emerald-300">11 Benchmarks</span>
                  </div>
                  <div className="text-[10px] text-slate-500">24.4k cohort validation</div>
                </button>

                <button
                  onClick={() => setSubTab('telemed')}
                  className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/40 text-left transition-all group"
                >
                  <div className="flex items-center space-x-2 text-indigo-400 mb-1">
                    <Network className="h-4 w-4" />
                    <span className="text-[11px] font-bold text-slate-200 group-hover:text-indigo-300">Network Sim</span>
                  </div>
                  <div className="text-[10px] text-slate-500">SimEvents 3.2 KB queuing</div>
                </button>

                <button
                  onClick={() => setSubTab('pitch')}
                  className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/40 text-left transition-all group"
                >
                  <div className="flex items-center space-x-2 text-purple-400 mb-1">
                    <Presentation className="h-4 w-4" />
                    <span className="text-[11px] font-bold text-slate-200 group-hover:text-purple-300">Pitch Deck</span>
                  </div>
                  <div className="text-[10px] text-slate-500">12 presentation slides</div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DEV GATE PROTECTION FOR RESTRICTED MODULES IF ACCESSED DIRECTLY WHILE LOCKED */}
      {['training', 'benchmarks', 'telemed', 'pitch'].includes(currentSubTab) && !isDevMode && (
        <div className="max-w-xl mx-auto py-8 space-y-4">
          <div className="bg-slate-900/90 rounded-2xl border border-amber-500/40 p-6 sm:p-8 shadow-2xl text-center space-y-5">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-inner">
              <Lock className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-100">
                Developer Access Required
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                This evaluation module is restricted to authorized SIH 2026 jury &amp; developers. Enter authorized developer passcode to unlock.
              </p>
            </div>

            <form onSubmit={handleDevUnlock} className="space-y-3 pt-2">
              <div className="relative max-w-sm mx-auto">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={devPassword}
                  onChange={(e) => { setDevPassword(e.target.value); setDevError(false); }}
                  placeholder="Enter Developer Passcode..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 pr-10 shadow-inner text-center"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>

              {devError && (
                <p className="text-xs text-rose-400 font-semibold flex items-center justify-center space-x-1.5">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>Invalid passcode entered. Access denied.</span>
                </p>
              )}

              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSubTab('general')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Back to Preferences
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-600/20 transition-all flex items-center space-x-1.5"
                >
                  <Unlock className="h-3.5 w-3.5" />
                  <span>Unlock Module</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW 2: REAL-TIME TRAINING STUDIO */}
      {currentSubTab === 'training' && isDevMode && (
        <div className="space-y-4">
          <RealtimeTrainingStudio />
        </div>
      )}

      {/* VIEW 3: 11 CLINICAL BENCHMARKS */}
      {currentSubTab === 'benchmarks' && isDevMode && (
        <div className="space-y-4">
          <BenchmarkView />
        </div>
      )}

      {/* VIEW 4: NETWORK SIMULATOR (SimEvents) */}
      {currentSubTab === 'telemed' && isDevMode && (
        <div className="space-y-4">
          <NetworkSim />
        </div>
      )}

      {/* VIEW 5: SIH PITCH DECK (12 Slides) */}
      {currentSubTab === 'pitch' && isDevMode && (
        <div className="space-y-4">
          <SlideDeck />
        </div>
      )}
    </div>
  );
}
