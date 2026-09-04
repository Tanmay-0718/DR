import React from 'react';
import { 
  Award, 
  AlertCircle, 
  CheckCircle2, 
  GitMerge, 
  Thermometer, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { ICDR_CLASSES } from '../utils/imageProcessing';

export default function GradingCard({ gradingData }) {
  if (!gradingData) return null;

  const {
    icdr_grade,
    class_info,
    confidence,
    probabilities,
    referable_dr,
    feature_vector
  } = gradingData;

  const gradeColors = {
    0: { border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' },
    1: { border: 'border-blue-500/40', bg: 'bg-blue-500/10', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-300' },
    2: { border: 'border-amber-500/40', bg: 'bg-amber-500/10', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300' },
    3: { border: 'border-orange-500/40', bg: 'bg-orange-500/10', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-300' },
    4: { border: 'border-rose-500/40', bg: 'bg-rose-500/10', text: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300' }
  };

  const currentTheme = gradeColors[icdr_grade] || gradeColors[0];

  return (
    <div className={`p-4 rounded-xl border ${currentTheme.border} ${currentTheme.bg} transition-all`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <Award className={`h-5 w-5 ${currentTheme.text}`} />
          <h4 className="text-sm font-semibold text-slate-100">
            Module 3: Fused Deep-Feature Clinical Grading
          </h4>
        </div>

        {/* Referable DR Status Pill */}
        <div className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
          referable_dr 
            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' 
            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
        }`}>
          {referable_dr ? (
            <>
              <AlertCircle className="h-3.5 w-3.5" />
              <span>REFERABLE DR (ACTION REQ.)</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>NON-REFERABLE (ROUTINE)</span>
            </>
          )}
        </div>
      </div>

      {/* Main Grade Banner */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-2">
        {/* Left: Grade Level Badge & Description */}
        <div className="md:col-span-7 bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-baseline space-x-3">
              <span className={`text-4xl font-extrabold font-mono ${currentTheme.text}`}>
                GRADE {icdr_grade}
              </span>
              <span className="text-lg font-bold text-slate-100">
                {class_info.name}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-2">
              {class_info.desc}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Clinical Protocol:</span>
            <span className={`font-semibold ${currentTheme.text}`}>
              {class_info.action}
            </span>
          </div>
        </div>

        {/* Right: Calibrated Confidence & Fused Feature Architecture */}
        <div className="md:col-span-5 bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center space-x-1">
                <Thermometer className="h-3.5 w-3.5 text-cyan-400" />
                <span>Calibrated Confidence</span>
              </span>
              <span className="font-mono font-bold text-cyan-300 text-sm">
                {(confidence * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full"
                style={{ width: `${Math.min(100, confidence * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-mono">
              Temperature Scaled (T = 1.35) for Clinical ECE &lt; 0.05
            </p>
          </div>

          {/* Fusion Architecture Diagram */}
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-[11px] space-y-1">
            <div className="flex items-center justify-between text-slate-300 font-medium">
              <span className="flex items-center space-x-1">
                <GitMerge className="h-3.5 w-3.5 text-indigo-400" />
                <span>Feature Fusion Architecture</span>
              </span>
              <span className="text-[10px] text-indigo-300 bg-indigo-950/60 px-1 py-0.5 rounded border border-indigo-800">
                Dense Head
              </span>
            </div>
            <div className="flex items-center space-x-1 text-slate-400 text-[10px] font-mono">
              <span>CNN Embedding (128-d)</span>
              <span>+</span>
              <span className="text-cyan-400">Handcrafted (6-d)</span>
              <span>→</span>
              <span className="text-emerald-400 font-bold">Fused Logits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Class Probabilities Row */}
      <div className="mt-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
        <h5 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          5-Class ICDR Probability Distribution
        </h5>
        <div className="grid grid-cols-5 gap-2">
          {ICDR_CLASSES.map((cls, idx) => {
            const prob = probabilities[idx] || 0;
            const isTarget = idx === icdr_grade;
            return (
              <div key={cls.grade} className="text-center">
                <div className="text-[10px] text-slate-400 truncate mb-1">
                  Gr {cls.grade}
                </div>
                <div className="h-12 bg-slate-800/60 rounded flex items-end p-0.5 relative overflow-hidden">
                  <div 
                    className={`w-full rounded-sm transition-all duration-300 ${
                      isTarget ? 'bg-cyan-400 shadow-sm' : 'bg-slate-600'
                    }`}
                    style={{ height: `${Math.max(6, prob * 100)}%` }}
                  />
                </div>
                <div className={`text-[10px] font-mono mt-1 ${isTarget ? 'font-bold text-cyan-300' : 'text-slate-500'}`}>
                  {(prob * 100).toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
