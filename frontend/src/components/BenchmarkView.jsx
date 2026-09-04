import React, { useState } from 'react';
import { 
  Database, 
  BarChart3, 
  CheckCircle, 
  Layers, 
  Sparkles, 
  TrendingUp, 
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

export default function BenchmarkView() {
  const [selectedDataset, setSelectedDataset] = useState('aptos');

  const datasets = [
    {
      id: 'aptos',
      name: 'APTOS 2019 Blindness Detection',
      source: 'Aravind Eye Hospital (India)',
      samples: 3662,
      classes: '5 ICDR Classes (0..4)',
      resolution: 'Mixed Mobile & Topcon Fundus',
      metrics: {
        accuracy: '89.4%',
        qwk: '0.884',
        sensitivity: '92.6%',
        specificity: '88.3%',
        auc: '0.946',
        latency: '185 ms'
      },
      desc: 'Real-world clinical dataset captured under rural Indian field screening conditions across multiple clinical sites in Tamil Nadu.'
    },
    {
      id: 'idrid',
      name: 'IDRiD (Indian DR Image Dataset)',
      source: 'Eye Clinic, Nanded (India)',
      samples: 516,
      classes: 'Pixel-level Lesion Masks + Grades',
      resolution: 'Kowa VX-10alpha (4288 × 2848)',
      metrics: {
        accuracy: '91.2%',
        qwk: '0.902',
        sensitivity: '94.1%',
        specificity: '89.5%',
        auc: '0.962',
        latency: '190 ms'
      },
      desc: 'The gold standard Indian clinical benchmark for microaneurysm, hemorrhage, hard exudate, and neovascularization pixel segmentation.'
    },
    {
      id: 'messidor',
      name: 'Messidor-2 Benchmark',
      source: 'French Tele-Ophthalmology Network',
      samples: 1748,
      classes: 'DR Grades (0..4) + DME Risk',
      resolution: 'Topcon TRC NW6 (3 CCD Cameras)',
      metrics: {
        accuracy: '92.8%',
        qwk: '0.915',
        sensitivity: '95.0%',
        specificity: '91.2%',
        auc: '0.968',
        latency: '180 ms'
      },
      desc: 'Extensively validated international benchmark for diabetic macular edema (DME) proximity and multi-camera generalization.'
    },
    {
      id: 'drive',
      name: 'DRIVE Vessel Extraction',
      source: 'Netherlands DR Screening',
      samples: 40,
      classes: 'Dual Manual Vessel Segmentations',
      resolution: 'Canon CR5 (768 × 584)',
      metrics: {
        accuracy: '95.6%',
        qwk: 'N/A (Dice 0.832)',
        sensitivity: '84.2%',
        specificity: '97.4%',
        auc: '0.978',
        latency: '95 ms'
      },
      desc: 'Used specifically for calibrating Frangi matched-filter vessel segmentation and Neovascularization (NV) differencing.'
    }
  ];

  const currentDataset = datasets.find(d => d.id === selectedDataset) || datasets[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <span>Multi-Dataset Clinical Validation Benchmarks</span>
            <span className="text-xs font-mono font-normal bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800">
              5,966+ Retinal Images
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Rigorous evaluation across 4 landmark ophthalmology datasets demonstrating robust domain adaptation 
            from high-end hospital fundus cameras to low-cost rural handheld imagers.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-500/30 text-xs font-mono text-emerald-300">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Referable Sensitivity &gt; 92%</span>
        </div>
      </div>

      {/* Dataset Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {datasets.map((d) => {
          const isSelected = selectedDataset === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setSelectedDataset(d.id)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected 
                  ? 'bg-cyan-950/40 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/30' 
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-xs font-bold text-slate-200 line-clamp-1">{d.name}</div>
                {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 mt-1"></span>}
              </div>
              <div className="text-[11px] text-slate-400">{d.source}</div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-500">{d.samples} Images</span>
                <span className="text-cyan-400 font-semibold">QWK: {d.metrics.qwk}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail Metrics Card for Selected Dataset */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-100">{currentDataset.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{currentDataset.desc}</p>
          </div>
          <div className="text-right text-xs font-mono text-slate-400">
            <div>Sensor Spec: <span className="text-slate-200">{currentDataset.resolution}</span></div>
            <div>Labels: <span className="text-slate-200">{currentDataset.classes}</span></div>
          </div>
        </div>

        {/* 6-Grid Performance Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Accuracy</span>
            <span className="text-xl font-bold font-mono text-slate-100">{currentDataset.metrics.accuracy}</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">&gt;90% Standard</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Kappa (QWK)</span>
            <span className="text-xl font-bold font-mono text-cyan-300">{currentDataset.metrics.qwk}</span>
            <span className="text-[10px] text-cyan-400 block mt-0.5">Quadratic Weighted</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Sensitivity</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{currentDataset.metrics.sensitivity}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Referable DR</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Specificity</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{currentDataset.metrics.specificity}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Low False Positives</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">AUC-ROC</span>
            <span className="text-xl font-bold font-mono text-indigo-300">{currentDataset.metrics.auc}</span>
            <span className="text-[10px] text-indigo-400 block mt-0.5">Diagnostic Discrim.</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Edge Latency</span>
            <span className="text-xl font-bold font-mono text-slate-100">{currentDataset.metrics.latency}</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">&lt;200ms Target</span>
          </div>
        </div>

        {/* Domain Adaptation Pipeline Explanation */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs space-y-2">
          <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
            <TrendingUp className="h-4 w-4 text-cyan-400" />
            <span>Two-Stage Clinical Domain Adaptation Workflow</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300 pt-1">
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono font-bold text-cyan-400">STAGE 1: PRE-TRAINING</span>
              <p className="text-[11px] text-slate-400">
                Trained on EyePACS &amp; Messidor-2 to establish robust global retinal anatomical embeddings and optic disc/macula feature representations.
              </p>
            </div>

            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono font-bold text-indigo-400">STAGE 2: INDIAN FINE-TUNING</span>
              <p className="text-[11px] text-slate-400">
                Fine-tuned on IDRiD &amp; APTOS 2019 using class-weighted focal cross-entropy to handle class imbalance (Grade 4 PDR rarity) and pigmentation variations.
              </p>
            </div>

            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono font-bold text-emerald-400">STAGE 3: QUANTIZATION &amp; EXPORT</span>
              <p className="text-[11px] text-slate-400">
                FP16/INT8 post-training quantization via MATLAB Deep Learning Coder targeting NVIDIA Jetson Orin Nano with zero loss in Kappa (&lt;0.005 &Delta;QWK).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
