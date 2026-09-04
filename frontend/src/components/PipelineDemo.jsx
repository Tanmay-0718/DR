import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Upload, 
  RefreshCw, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  SAMPLE_CATALOG, 
  runFullPipeline 
} from '../utils/imageProcessing';
import IQAGate from './IQAGate';
import SegmentationViewer from './SegmentationViewer';
import GradingCard from './GradingCard';
import XAIReport from './XAIReport';

export default function PipelineDemo() {
  const [selectedSample, setSelectedSample] = useState(SAMPLE_CATALOG[0]);
  const [customImageSrc, setCustomImageSrc] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [pipelineResult, setPipelineResult] = useState(null);
  const [gradcamActive, setGradcamActive] = useState(false);

  // Run pipeline when sample changes
  const executePipeline = async (imgSrc, sampleObj = null) => {
    setIsRunning(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imgSrc;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const result = await runFullPipeline(img, sampleObj ? sampleObj.id : null);
      setPipelineResult(result);
    } catch (err) {
      console.error('Pipeline execution error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (selectedSample) {
      executePipeline(selectedSample.path, selectedSample);
    }
  }, [selectedSample]);

  // Handle custom upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target.result;
        setCustomImageSrc(src);
        setSelectedSample(null);
        executePipeline(src, null);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentImageSrc = selectedSample ? selectedSample.path : customImageSrc;

  return (
    <div className="space-y-6">
      {/* Top Banner / Introduction */}
      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <span>Clinical Diagnostic Pipeline</span>
            <span className="text-xs font-mono font-normal bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800">
              End-to-End Edge Architecture
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Select a verified clinical ground-truth retinal case below or upload a custom fundus photograph. 
            The system executes Module 1 (IQA Gate), Module 2 (Multi-head Segmentation), Module 3 (Fused Grading), and Module 4 (XAI Triage).
          </p>
        </div>

        {/* Custom Upload Button */}
        <label className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700 transition-colors shadow-sm">
          <Upload className="h-4 w-4 text-cyan-400" />
          <span>Upload Custom Fundus Image</span>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileUpload} 
            className="hidden" 
          />
        </label>
      </div>

      {/* Preset Sample Selector Tray */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Preset Clinical Test Cases</span>
          <span className="text-[11px] text-slate-500 font-mono">
            Ground-truth calibrated across APTOS 2019 &amp; IDRiD
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {SAMPLE_CATALOG.map((sample) => {
            const isSelected = selectedSample && selectedSample.id === sample.id;
            return (
              <button
                key={sample.id}
                onClick={() => {
                  setSelectedSample(sample);
                  setCustomImageSrc(null);
                }}
                className={`p-2 rounded-lg border text-left flex flex-col justify-between transition-all ${
                  isSelected 
                    ? 'bg-cyan-950/40 border-cyan-500/80 shadow-sm ring-1 ring-cyan-500/30' 
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-mono font-bold px-1 rounded ${
                    sample.grade !== null 
                      ? (sample.isReferable ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300')
                      : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {sample.grade !== null ? `Gr ${sample.grade}` : 'IQA Gate'}
                  </span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                </div>
                <div className="text-[11px] font-semibold text-slate-200 line-clamp-1">
                  {sample.title.split(':')[0]}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {sample.title.split(':')[1] || sample.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Pipeline Display */}
      {isRunning ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
          <div className="text-sm font-semibold text-slate-200">Executing Edge Pipeline...</div>
          <div className="text-xs text-slate-500 font-mono">Running IQA Laplace gate &bull; TensorRT-accelerated inference</div>
        </div>
      ) : pipelineResult ? (
        <div className="space-y-6">
          {/* Module 1: IQA Edge Gate */}
          <IQAGate iqaData={pipelineResult} />

          {/* If ungradable, stop here (short-circuit proof) */}
          {pipelineResult.is_gradable && (
            <>
              {/* Module 2: Segmentation Viewer */}
              <SegmentationViewer 
                imageUrl={currentImageSrc}
                segmentationData={pipelineResult}
                gradcamActive={gradcamActive}
                setGradcamActive={setGradcamActive}
                grade={pipelineResult.icdr_grade}
              />

              {/* Module 3: Grading & Calibrated Confidence */}
              <GradingCard gradingData={pipelineResult} />

              {/* Module 4: XAI Clinician Report Sheet */}
              <XAIReport result={pipelineResult} />
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
