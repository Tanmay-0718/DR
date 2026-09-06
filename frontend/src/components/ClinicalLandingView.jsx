import React from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Eye,
  Cloud
} from 'lucide-react';

/**
 * ClinicalLandingView
 * Implements Panel 4 of user sketch:
 * - Left: Image of clinic where doctor checking eye
 * - Right: Details about DR + [Start] button
 */
export default function ClinicalLandingView({ onStartScreening, onOpenRegistry }) {
  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2 sm:py-6">
      {/* Hero Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left Column: Image of clinic where doctor is checking eye */}
        <div className="lg:col-span-6 relative">
          {/* Subtle Ambient Glow */}
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 via-sky-500/10 to-indigo-500/20 rounded-3xl blur-2xl opacity-60" />

          {/* Clinical Image Card */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900 group">
            <img 
              src="/assets/clinic_eye_exam.jpg" 
              alt="Ophthalmologist examining patient eye with fundus camera in clinic"
              className="w-full h-[340px] sm:h-[420px] object-cover object-center transform group-hover:scale-102 transition-transform duration-500"
            />

            {/* Gradient Vignette Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />

            {/* Floating Accreditation Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-950/80 text-cyan-300 border border-cyan-500/40 backdrop-blur-md shadow-lg">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Clinical Slit-Lamp / Fundus Screening</span>
              </span>
            </div>

            {/* Bottom Caption inside Image Card */}
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-100">Primary Health Center (PHC) Ready</div>
                  <div className="text-[11px] text-slate-400">Validated across 24,403 multi-cohort fundus images</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                ETDRS 4-2-1
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Details about DR + [Start] button */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header Pill */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium">
            <Eye className="h-3.5 w-3.5 text-cyan-400" />
            <span>Autonomous Tele-Ophthalmology Portal</span>
          </div>

          {/* Main Title */}
          <div>
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Early Detection of <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">Diabetic Retinopathy</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mt-3">
              Over <strong>77 million individuals in India</strong> live with diabetes. Diabetic Retinopathy is the leading cause of preventable adult blindness, yet <strong>90%+ of vision loss can be prevented</strong> through timely fundus screening.
            </p>
          </div>

          {/* High-Impact Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onStartScreening}
              className="px-8 py-4 rounded-xl font-bold text-base bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:via-sky-400 hover:to-indigo-500 text-white shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-3 group"
            >
              <Eye className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>Start Patient Screening</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {onOpenRegistry && (
              <button
                onClick={onOpenRegistry}
                className="px-6 py-4 rounded-xl font-semibold text-sm bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 transition-all flex items-center justify-center space-x-2.5 shadow-lg"
              >
                <Cloud className="h-4 w-4 text-cyan-400" />
                <span>Search Cloud EHR Registry</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
