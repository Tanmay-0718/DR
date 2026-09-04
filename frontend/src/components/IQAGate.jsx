import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Cpu, 
  Focus, 
  Sun, 
  Maximize2,
  RefreshCw
} from 'lucide-react';

export default function IQAGate({ iqaData }) {
  if (!iqaData) return null;

  const { is_gradable, iqa_reason, metrics } = iqaData;

  const isSharpPass = metrics.sharpness >= metrics.sharpness_thresh;
  const isIllumPass = metrics.illumination >= metrics.illum_lower && metrics.illumination <= metrics.illum_upper;
  const isFovPass = metrics.fov_ratio >= metrics.fov_thresh;

  const reasonGuidance = {
    blur: {
      title: 'MOTION BLUR / LOSS OF FOCUS DETECTED',
      desc: 'Laplacian variance fell below edge threshold (<0.00015). Retinal microaneurysms and fine capillaries cannot be resolved.',
      action: 'Hold fundus camera steady against patient orbit, instruct patient to fixate on the green internal target, and re-capture.'
    },
    illumination: {
      title: 'POOR RETINAL ILLUMINATION / FLASH ARTIFACT',
      desc: 'Retinal luminance is outside calibrated bounds [8.0, 92.0]. Severe underexposure or optical glare corrupts vascular segmentation.',
      action: 'Dim examination room ambient lighting or check patient pupil dilation (>4mm recommended for non-mydriatic cameras).'
    },
    fov_cutoff: {
      title: 'FIELD-OF-VIEW (FOV) CUTOFF / SENSOR MISALIGNMENT',
      desc: 'Valid retina aperture covers <35% of camera sensor area. Fovea and optic disc cannot both be verified.',
      action: 'Re-center camera optical axis directly on the macula/disc midpoint and ensure patient eye is aligned.'
    }
  };

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      is_gradable 
        ? 'bg-slate-900/60 border-slate-800' 
        : 'bg-rose-950/20 border-rose-500/40'
    }`}>
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          {is_gradable ? (
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
          ) : (
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
            </div>
          )}
          <div>
            <h4 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
              <span>Module 1: IQA Edge Gate</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider ${
                is_gradable ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {is_gradable ? 'Gradable (Pass)' : `Short-Circuit: ${iqa_reason}`}
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Quality triage executed locally on device prior to deep learning pipeline
            </p>
          </div>
        </div>

        {/* Edge Latency Badge */}
        <div className="flex items-center space-x-2 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
          <Clock className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-slate-400">Edge Latency:</span>
          <span className="font-mono font-bold text-cyan-300">{metrics.latency_ms} ms</span>
          <span className="text-[10px] text-emerald-400 font-mono">(&lt;200ms ✓)</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
        {/* Metric 1: Sharpness */}
        <div className={`p-3 rounded-lg border text-xs ${
          isSharpPass ? 'bg-slate-800/40 border-slate-700/60' : 'bg-rose-900/20 border-rose-500/40'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <Focus className="h-3.5 w-3.5 text-slate-300" />
              <span>Sharpness (Laplacian)</span>
            </span>
            <span className={`font-mono font-bold ${isSharpPass ? 'text-emerald-400' : 'text-rose-400'}`}>
              {metrics.sharpness.toFixed(6)}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full ${isSharpPass ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(100, (metrics.sharpness / 0.00030) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>Cutoff: &gt;={metrics.sharpness_thresh}</span>
            <span>{isSharpPass ? 'Sharp' : 'Blurry'}</span>
          </div>
        </div>

        {/* Metric 2: Illumination */}
        <div className={`p-3 rounded-lg border text-xs ${
          isIllumPass ? 'bg-slate-800/40 border-slate-700/60' : 'bg-rose-900/20 border-rose-500/40'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <Sun className="h-3.5 w-3.5 text-slate-300" />
              <span>Illumination (LAB L*)</span>
            </span>
            <span className={`font-mono font-bold ${isIllumPass ? 'text-emerald-400' : 'text-rose-400'}`}>
              {metrics.illumination}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full ${isIllumPass ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(100, (metrics.illumination / 100) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>Range: [{metrics.illum_lower}, {metrics.illum_upper}]</span>
            <span>{isIllumPass ? 'Balanced' : 'Out-of-Bounds'}</span>
          </div>
        </div>

        {/* Metric 3: Circular FOV */}
        <div className={`p-3 rounded-lg border text-xs ${
          isFovPass ? 'bg-slate-800/40 border-slate-700/60' : 'bg-rose-900/20 border-rose-500/40'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <Maximize2 className="h-3.5 w-3.5 text-slate-300" />
              <span>Circular FOV Aperture</span>
            </span>
            <span className={`font-mono font-bold ${isFovPass ? 'text-emerald-400' : 'text-rose-400'}`}>
              {(metrics.fov_ratio * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full ${isFovPass ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(100, (metrics.fov_ratio / 0.8) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>Cutoff: &gt;={(metrics.fov_thresh * 100).toFixed(0)}%</span>
            <span>{isFovPass ? 'Complete' : 'Cropped'}</span>
          </div>
        </div>
      </div>

      {/* Short-Circuit Alert Notice if Ungradable */}
      {!is_gradable && (
        <div className="mt-3 p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-rose-300 uppercase tracking-wide">
                {reasonGuidance[iqa_reason]?.title || 'UNGRADABLE IMAGE REJECTED'}
              </div>
              <p className="text-slate-300">
                {reasonGuidance[iqa_reason]?.desc}
              </p>
              <div className="pt-2 flex items-center space-x-2 text-rose-200">
                <RefreshCw className="h-3.5 w-3.5 text-rose-400" />
                <span className="font-semibold">Protocol:</span>
                <span>{reasonGuidance[iqa_reason]?.action}</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 border-t border-rose-500/20 pt-1.5 font-mono">
                ⚡ SHORT-CIRCUIT ACTIVE: Modules 2 (Segmentation) and 3 (ICDR Grading) were aborted in {metrics.latency_ms}ms to conserve edge compute and eliminate false positive diagnostic reports.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
