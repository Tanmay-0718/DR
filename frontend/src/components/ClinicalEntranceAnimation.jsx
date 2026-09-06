import React, { useState, useEffect } from 'react';
import { Eye, ArrowRight, Sparkles } from 'lucide-react';

/**
 * ClinicalEntranceAnimation
 * Implements the 4-step entrance animation sketched by user:
 * 1) Logo appears in center of screen with glowing pulse
 * 2) "Chakshuh" brand title animates in beside/under logo
 * 3) Logo and title glide smoothly up to the top side (navbar position)
 * 4) Triggers completion to reveal the main landing screen
 */
export default function ClinicalEntranceAnimation({ onComplete, autoSkip = false }) {
  // Phase 1: Logo pulse in center (0..800ms)
  // Phase 2: "Chakshuh" text appears (800..2000ms)
  // Phase 3: Glides to top side (2000..2850ms)
  // Phase 4: Done (2850ms+)
  const [phase, setPhase] = useState(1);

  useEffect(() => {
    if (autoSkip) {
      onComplete();
      return;
    }

    const t1 = setTimeout(() => setPhase(2), 800);
    const t2 = setTimeout(() => setPhase(3), 2000);
    const t3 = setTimeout(() => {
      setPhase(4);
      onComplete();
    }, 2850);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [autoSkip, onComplete]);

  const handleSkip = () => {
    setPhase(4);
    onComplete();
  };

  if (phase === 4) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center overflow-hidden select-none">
      {/* Subtle radial ambient background glows */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-3xl pointer-events-none -bottom-20 -right-20" />

      {/* Main Animated Branding Unit */}
      <div 
        className={`transition-all duration-700 ease-in-out flex items-center space-x-3 sm:space-x-4 ${
          phase === 3 
            ? 'fixed top-4 left-4 sm:left-8 scale-90 -translate-y-1' 
            : 'transform -translate-y-6 scale-125 sm:scale-150'
        }`}
      >
        {/* Step 1: Animated Ocular Logo */}
        <div className="relative group">
          {/* Animated Glowing Ring */}
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 rounded-2xl blur-lg opacity-70 animate-pulse" />
          
          <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-2xl ring-2 ring-white/30">
            <Eye className="h-8 w-8 sm:h-9 sm:w-9 text-white animate-pulse" />
          </div>
        </div>

        {/* Step 2: "Chakshuh" Text Animation */}
        <div 
          className={`transition-all duration-700 ease-out overflow-hidden flex flex-col justify-center ${
            phase >= 2 
              ? 'opacity-100 translate-x-0 max-w-[320px]' 
              : 'opacity-0 -translate-x-6 max-w-0'
          }`}
        >
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
              Chakshuh
            </h1>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wide mt-1 whitespace-nowrap">
            Autonomous Retinal Tele-Ophthalmology
          </p>
        </div>
      </div>

      {/* Step Indicator & Hint in center during Phase 1 & 2 */}
      {phase < 3 && (
        <div className="absolute bottom-16 flex flex-col items-center space-y-2 text-center text-xs text-slate-500 animate-fade-in">
          <div className="flex items-center space-x-1.5 text-cyan-400 font-mono text-[11px]">
            <Sparkles className="h-3.5 w-3.5 animate-spin" />
            <span>Initializing Ocular Edge Engine...</span>
          </div>
          <span className="text-[10px] text-slate-600">
            Phase {phase} of 3 &bull; Loading Clinical Knowledge Base
          </span>
        </div>
      )}

      {/* Skip button on bottom right */}
      <button
        onClick={handleSkip}
        className="absolute bottom-6 right-6 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-medium transition-all flex items-center space-x-1.5 shadow-lg backdrop-blur-sm"
      >
        <span>Skip Intro</span>
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}
