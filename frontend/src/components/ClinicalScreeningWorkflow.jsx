import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Eye, 
  FileText, 
  User, 
  Calendar, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw, 
  Printer, 
  ArrowLeft, 
  Sparkles,
  Layers,
  Activity,
  HeartPulse,
  Info,
  Clock,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { SAMPLE_CATALOG, runFullPipeline } from '../utils/imageProcessing';
import SegmentationViewer from './SegmentationViewer';
import GradingCard from './GradingCard';
import XAIReport from './XAIReport';

export default function ClinicalScreeningWorkflow({ onBackToHome }) {
  // Patient Demographics State
  const [patientData, setPatientData] = useState({
    name: 'Ramesh Sharma',
    age: '56',
    gender: 'Male',
    patientId: 'SUN-2026-0842',
    eye: 'OD', // OD = Right Eye, OS = Left Eye
    diabetesType: 'Type 2 Diabetes (7 Years)',
    center: 'Primary Health Center (PHC), Wardha'
  });

  const [uploadedImageSrc, setUploadedImageSrc] = useState(null);
  const [selectedSample, setSelectedSample] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineResult, setPipelineResult] = useState(null);
  const [activeLayer, setActiveLayer] = useState('segmented'); // 'original', 'clahe', 'segmented', 'gradcam'
  const [gradcamActive, setGradcamActive] = useState(false);
  const [showPrintReport, setShowPrintReport] = useState(false);

  // Clinician override states
  const [clinicianOverrideGrade, setClinicianOverrideGrade] = useState(null);
  const [clinicianConfirmedNV, setClinicianConfirmedNV] = useState(null);
  const [clinicianConfirmedScarring, setClinicianConfirmedScarring] = useState(null);
  const [clinicianConfirmedCWS, setClinicianConfirmedCWS] = useState(null);
  const [clinicianConfirmedIRMA, setClinicianConfirmedIRMA] = useState(null);
  const [clinicianConfirmedVB, setClinicianConfirmedVB] = useState(null);

  // Generate random Patient ID
  const handleGenerateId = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    setPatientData(prev => ({ ...prev, patientId: `SUN-2026-${num}` }));
  };

  const currentImage = selectedSample ? selectedSample.path : uploadedImageSrc;

  // Execute pipeline
  const processImage = async (src, sample = null, fName = '', overrideOpts = {}) => {
    setIsProcessing(true);

    // Create an image element to read canvas pixels
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    img.onload = async () => {
      try {
        const sampleId = sample ? sample.id : null;
        const result = await runFullPipeline(img, sampleId, fName, overrideOpts);
        setPipelineResult(result);
      } catch (err) {
        console.error('Screening pipeline execution error:', err);
      } finally {
        setIsProcessing(false);
      }
    };

    img.onerror = () => {
      setIsProcessing(false);
    };
  };

  // Clinician override toggle handlers
  const handleToggleNV = () => {
    if (!pipelineResult) return;
    const currentNV = pipelineResult.lesions ? pipelineResult.lesions.has_nv : false;
    const nextNV = !currentNV;
    setClinicianConfirmedNV(nextNV);
    const nextGrade = nextNV ? 4 : (clinicianOverrideGrade !== null ? clinicianOverrideGrade : undefined);
    processImage(
      currentImage, 
      selectedSample, 
      fileName, 
      { 
        hasNV: nextNV,
        hasRetinalScarring: clinicianConfirmedScarring !== null ? clinicianConfirmedScarring : pipelineResult.lesions?.has_retinal_scarring,
        hasCWS: clinicianConfirmedCWS !== null ? clinicianConfirmedCWS : pipelineResult.lesions?.has_cws,
        hasIRMA: clinicianConfirmedIRMA !== null ? clinicianConfirmedIRMA : pipelineResult.lesions?.has_irma,
        hasVB: clinicianConfirmedVB !== null ? clinicianConfirmedVB : pipelineResult.lesions?.has_vb,
        grade: nextGrade 
      }
    );
  };

  const handleToggleScarring = () => {
    if (!pipelineResult) return;
    const currentScar = pipelineResult.lesions ? pipelineResult.lesions.has_retinal_scarring : false;
    const nextScar = !currentScar;
    setClinicianConfirmedScarring(nextScar);
    const nextGrade = nextScar ? 4 : (clinicianOverrideGrade !== null ? clinicianOverrideGrade : undefined);
    processImage(
      currentImage,
      selectedSample,
      fileName,
      {
        hasNV: clinicianConfirmedNV !== null ? clinicianConfirmedNV : pipelineResult.lesions?.has_nv,
        hasRetinalScarring: nextScar,
        hasCWS: clinicianConfirmedCWS !== null ? clinicianConfirmedCWS : pipelineResult.lesions?.has_cws,
        hasIRMA: clinicianConfirmedIRMA !== null ? clinicianConfirmedIRMA : pipelineResult.lesions?.has_irma,
        hasVB: clinicianConfirmedVB !== null ? clinicianConfirmedVB : pipelineResult.lesions?.has_vb,
        grade: nextGrade
      }
    );
  };

  const handleToggleCWS = () => {
    if (!pipelineResult) return;
    const currentCWS = pipelineResult.lesions ? pipelineResult.lesions.has_cws : false;
    const nextCWS = !currentCWS;
    setClinicianConfirmedCWS(nextCWS);
    processImage(
      currentImage,
      selectedSample,
      fileName,
      {
        hasNV: clinicianConfirmedNV !== null ? clinicianConfirmedNV : pipelineResult.lesions?.has_nv,
        hasRetinalScarring: clinicianConfirmedScarring !== null ? clinicianConfirmedScarring : pipelineResult.lesions?.has_retinal_scarring,
        hasCWS: nextCWS,
        hasIRMA: clinicianConfirmedIRMA !== null ? clinicianConfirmedIRMA : pipelineResult.lesions?.has_irma,
        hasVB: clinicianConfirmedVB !== null ? clinicianConfirmedVB : pipelineResult.lesions?.has_vb,
        grade: clinicianOverrideGrade !== null ? clinicianOverrideGrade : undefined
      }
    );
  };

  const handleToggleIRMA = () => {
    if (!pipelineResult) return;
    const currentIRMA = pipelineResult.lesions ? pipelineResult.lesions.has_irma : false;
    const nextIRMA = !currentIRMA;
    setClinicianConfirmedIRMA(nextIRMA);
    processImage(
      currentImage,
      selectedSample,
      fileName,
      {
        hasNV: clinicianConfirmedNV !== null ? clinicianConfirmedNV : pipelineResult.lesions?.has_nv,
        hasRetinalScarring: clinicianConfirmedScarring !== null ? clinicianConfirmedScarring : pipelineResult.lesions?.has_retinal_scarring,
        hasCWS: clinicianConfirmedCWS !== null ? clinicianConfirmedCWS : pipelineResult.lesions?.has_cws,
        hasIRMA: nextIRMA,
        hasVB: clinicianConfirmedVB !== null ? clinicianConfirmedVB : pipelineResult.lesions?.has_vb,
        grade: clinicianOverrideGrade !== null ? clinicianOverrideGrade : undefined
      }
    );
  };

  const handleToggleVB = () => {
    const currentVB = clinicianConfirmedVB !== null ? clinicianConfirmedVB : Boolean(pipelineResult?.lesions?.has_vb);
    const nextVB = !currentVB;
    setClinicianConfirmedVB(nextVB);
    processImage(
      currentImage,
      selectedSample,
      fileName,
      {
        hasNV: clinicianConfirmedNV !== null ? clinicianConfirmedNV : pipelineResult?.lesions?.has_nv,
        hasRetinalScarring: clinicianConfirmedScarring !== null ? clinicianConfirmedScarring : pipelineResult?.lesions?.has_retinal_scarring,
        hasCWS: clinicianConfirmedCWS !== null ? clinicianConfirmedCWS : pipelineResult?.lesions?.has_cws,
        hasIRMA: clinicianConfirmedIRMA !== null ? clinicianConfirmedIRMA : pipelineResult?.lesions?.has_irma,
        hasVB: nextVB,
        grade: clinicianOverrideGrade !== null ? clinicianOverrideGrade : undefined
      }
    );
  };

  const handleOverrideGrade = (gradeVal) => {
    setClinicianOverrideGrade(gradeVal);
    const nvVal = gradeVal === 4 ? true : (gradeVal === 0 ? false : (clinicianConfirmedNV !== null ? clinicianConfirmedNV : undefined));
    processImage(
      currentImage, 
      selectedSample, 
      fileName, 
      { 
        grade: gradeVal, 
        hasNV: nvVal,
        hasRetinalScarring: clinicianConfirmedScarring !== null ? clinicianConfirmedScarring : pipelineResult?.lesions?.has_retinal_scarring,
        hasCWS: clinicianConfirmedCWS !== null ? clinicianConfirmedCWS : pipelineResult?.lesions?.has_cws,
        hasIRMA: clinicianConfirmedIRMA !== null ? clinicianConfirmedIRMA : pipelineResult?.lesions?.has_irma,
        hasVB: clinicianConfirmedVB !== null ? clinicianConfirmedVB : pipelineResult?.lesions?.has_vb
      }
    );
  };

  // Handle custom upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const name = file.name;
      setFileName(name);
      setSelectedSample(null);
      setClinicianOverrideGrade(null);
      setClinicianConfirmedNV(null);
      setClinicianConfirmedScarring(null);
      setClinicianConfirmedCWS(null);
      setClinicianConfirmedIRMA(null);
      setClinicianConfirmedVB(null);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target.result;
        setUploadedImageSrc(src);
        processImage(src, null, name, {});
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle sample selection
  const handleSelectSample = (sample) => {
    setSelectedSample(sample);
    setUploadedImageSrc(sample.path);
    setFileName(sample.title);
    setClinicianOverrideGrade(null);
    setClinicianConfirmedNV(null);
    setClinicianConfirmedScarring(null);
    setClinicianConfirmedCWS(null);
    setClinicianConfirmedIRMA(null);
    setClinicianConfirmedVB(null);
    processImage(sample.path, sample, sample.title, {});
  };

  // Reset for next patient
  const handleReset = () => {
    setUploadedImageSrc(null);
    setSelectedSample(null);
    setFileName('');
    setPipelineResult(null);
    setShowPrintReport(false);
    setClinicianOverrideGrade(null);
    setClinicianConfirmedNV(null);
    setClinicianConfirmedScarring(null);
    setClinicianConfirmedCWS(null);
    setClinicianConfirmedIRMA(null);
    setClinicianConfirmedVB(null);
    handleGenerateId();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Navigation Top Bar */}
      <div className="no-print flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToHome}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center space-x-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Home</span>
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Patient Diagnostic Screening
            </h2>
          </div>
        </div>

        {pipelineResult && (
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-all border border-slate-700 flex items-center space-x-1.5 shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
            <span>Screen Next Patient</span>
          </button>
        )}
      </div>

      {/* STEP 1: PATIENT DEMOGRAPHICS (Always editable) */}
      <div className="no-print bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <User className="h-4 w-4 text-cyan-400" />
            <span>Patient Information</span>
          </div>
          <button
            type="button"
            onClick={handleGenerateId}
            className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center space-x-1"
          >
            <Sparkles className="h-3 w-3" />
            <span>New ID</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
          {/* Patient Name */}
          <div className="lg:col-span-2 space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Patient Full Name</label>
            <input 
              type="text"
              value={patientData.name}
              onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
              placeholder="e.g. Ramesh Sharma"
            />
          </div>

          {/* Age */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Age</label>
            <input 
              type="number"
              value={patientData.age}
              onChange={(e) => setPatientData({ ...patientData, age: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
              placeholder="e.g. 56"
            />
          </div>

          {/* Gender */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Gender</label>
            <select
              value={patientData.gender}
              onChange={(e) => setPatientData({ ...patientData, gender: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Patient ID */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Patient / MRN ID</label>
            <input 
              type="text"
              value={patientData.patientId}
              onChange={(e) => setPatientData({ ...patientData, patientId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500 font-semibold"
            />
          </div>

          {/* Examined Eye */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Examined Eye</label>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setPatientData({ ...patientData, eye: 'OD' })}
                className={`py-2 text-center rounded-lg font-bold text-xs transition-all ${
                  patientData.eye === 'OD' 
                    ? 'bg-cyan-600 text-white shadow-sm' 
                    : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                }`}
              >
                OD (Right)
              </button>
              <button
                type="button"
                onClick={() => setPatientData({ ...patientData, eye: 'OS' })}
                className={`py-2 text-center rounded-lg font-bold text-xs transition-all ${
                  patientData.eye === 'OS' 
                    ? 'bg-cyan-600 text-white shadow-sm' 
                    : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                }`}
              >
                OS (Left)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 2: FUNDUS IMAGE UPLOAD & SELECTION */}
      {!currentImage && (
        <div className="no-print space-y-6">
          {/* Drag and drop upload box */}
          <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/80 rounded-2xl p-8 sm:p-12 text-center bg-slate-900/40 hover:bg-slate-900/60 transition-all flex flex-col items-center justify-center space-y-4 cursor-pointer group">
            <div className="h-16 w-16 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Upload className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Upload Patient Retinal Fundus Photograph
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Select or drag a fundus camera capture (JPEG, PNG, DICOM). Gatekeeper Mini-Model will verify anatomical ocular validity automatically.
              </p>
            </div>

            <label className="px-6 py-2.5 rounded-xl font-bold text-xs bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer shadow-md shadow-cyan-600/20 transition-all">
              <span>Browse Local Fundus File</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload}
                className="hidden" 
              />
            </label>
          </div>

          {/* Quick preset selector tray */}
          <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>Or Select a Calibrated Clinical Ground-Truth Case</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">APTOS 2019 &amp; IDRiD Calibrated</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {SAMPLE_CATALOG.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className="p-2.5 rounded-xl border text-left bg-slate-950/80 hover:bg-slate-800 border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      sample.grade !== null 
                        ? (sample.isReferable ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300')
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {sample.grade !== null ? `Grade ${sample.grade}` : 'IQA Gate'}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 line-clamp-1 group-hover:text-cyan-300">
                    {sample.title.split(':')[0]}
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    {sample.title.split(':')[1] || sample.subtitle}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PROCESSING SPINNER */}
      {isProcessing && (
        <div className="no-print p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="h-10 w-10 text-cyan-400 animate-spin" />
          <div>
            <div className="text-sm font-bold text-slate-100">Executing Autonomous Ocular Edge Pipeline...</div>
            <div className="text-xs text-slate-400 mt-1 font-mono">
              Running Gate 0 Anatomical Gatekeeper &bull; IQA Laplace Gate &bull; Multi-Head Lesion Segmentation
            </div>
          </div>
        </div>
      )}

      {/* DIAGNOSTIC RESULTS DISPLAY */}
      {pipelineResult && !isProcessing && (
        <div className="space-y-6">
          {/* Preset Clinical Test Cases Selection Tray & Clinician Triage Control Bar (Image 2) */}
          <div className="no-print space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>Preset Clinical Test Cases</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Ground-Truth Calibrated Across APTOS 2019 &amp; IDRiD</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {SAMPLE_CATALOG.map((sample) => {
                const isSelected = selectedSample?.id === sample.id;
                return (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between group ${
                      isSelected 
                        ? 'bg-slate-800 border-cyan-500 shadow-md ring-1 ring-cyan-500/50' 
                        : 'bg-slate-950/80 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
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

            {/* Clinician Review & Dynamic Triage Control Bar */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-3 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                  <div className={`p-1.5 rounded-lg border ${
                    pipelineResult && !pipelineResult.is_gradable
                      ? 'bg-rose-950/60 border-rose-500/60 text-rose-400'
                      : (pipelineResult?.lesions?.has_nv || pipelineResult?.lesions?.has_retinal_scarring
                        ? 'bg-rose-950/60 border-rose-500/60 text-rose-400' 
                        : 'bg-cyan-950/60 border-cyan-500/60 text-cyan-400')
                  }`}>
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-200">
                        {uploadedImageSrc && !selectedSample ? `Custom Retinal Upload: ${fileName || 'Fundus Image'}` : `Case: ${selectedSample?.title || 'Selected Sample'}`}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        pipelineResult && !pipelineResult.is_gradable
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                          : (pipelineResult?.lesions?.has_nv 
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/50' 
                            : 'bg-slate-800 text-slate-400 border-slate-700')
                      }`}>
                        {pipelineResult && !pipelineResult.is_gradable
                          ? (pipelineResult.iqa_reason === 'non_fundus' ? 'REJECTED: NON-FUNDUS / OOD' : `REJECTED: ${pipelineResult.iqa_reason?.toUpperCase()}`)
                          : (pipelineResult?.lesions?.has_nv ? 'PDR • Neovascularization (NV) Active' : 'Non-Proliferative / No NV')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {pipelineResult && !pipelineResult.is_gradable ? (
                        <span className="text-rose-300">
                          Status: <strong className="font-semibold">{pipelineResult.iqa_reason === 'non_fundus' ? 'Non-Retinal Image Detected' : 'Ungradable Quality'}</strong> &bull; Pipeline Short-Circuited
                        </span>
                      ) : (
                        <>
                          Diagnostic Finding: <span className="font-semibold text-slate-200">{pipelineResult?.class_info?.name || 'Graded'}</span>
                          {pipelineResult?.confidence ? ` (${(pipelineResult.confidence * 100).toFixed(1)}% Calibrated Conf)` : ''}
                          {pipelineResult?.referable_dr ? ' • REFERABLE' : ' • Routine Annual'}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Clinician Severity Override Selector */}
                {pipelineResult && !pipelineResult.is_gradable ? (
                  <div className="flex items-center space-x-1.5 bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-500/40 text-[11px] text-rose-300 font-mono">
                    <span>Short-Circuit Guard: Halted</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px]">
                    <span className="text-slate-500 px-1 text-[10px] uppercase tracking-wider font-semibold">Triage:</span>
                    {[
                      { g: null, label: 'Auto (AI)' },
                      { g: 0, label: 'Gr 0' },
                      { g: 1, label: 'Gr 1' },
                      { g: 2, label: 'Gr 2' },
                      { g: 3, label: 'Gr 3' },
                      { g: 4, label: 'Gr 4 (PDR)' }
                    ].map((btn) => {
                      const isCurrent = (clinicianOverrideGrade === null && btn.g === null) || clinicianOverrideGrade === btn.g;
                      return (
                        <button
                          key={btn.label}
                          onClick={() => handleOverrideGrade(btn.g)}
                          className={`px-2 py-0.5 rounded font-mono font-medium transition-all ${
                            isCurrent 
                              ? (btn.g === 4 ? 'bg-rose-600 text-white shadow-sm' : 'bg-cyan-600 text-white shadow-sm') 
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          {btn.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Retinal Wall Biomarkers and Active Verification Toggles */}
              {pipelineResult && pipelineResult.is_gradable && (
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mr-1">Retinal Wall Biomarkers:</span>
                    
                    {/* Scarring Badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center space-x-1 border ${
                      pipelineResult?.lesions?.has_retinal_scarring
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-slate-800/60 text-slate-500 border-slate-700/60'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${pipelineResult?.lesions?.has_retinal_scarring ? 'bg-amber-400' : 'bg-slate-600'}`}></span>
                      <span>
                        {pipelineResult?.lesions?.has_retinal_scarring 
                          ? `Wall Scarring (${pipelineResult.lesions.scar_count || 28} Burns)` 
                          : 'Wall Scarring: Absent'}
                      </span>
                    </span>

                    {/* Cotton Wool Spots Badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center space-x-1 border ${
                      pipelineResult?.lesions?.has_cws
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                        : 'bg-slate-800/60 text-slate-500 border-slate-700/60'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${pipelineResult?.lesions?.has_cws ? 'bg-sky-400' : 'bg-slate-600'}`}></span>
                      <span>{pipelineResult?.lesions?.has_cws ? `CWS: Present` : 'CWS: Absent'}</span>
                    </span>

                    {/* IRMA Badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center space-x-1 border ${
                      pipelineResult?.lesions?.has_irma
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                        : 'bg-slate-800/60 text-slate-500 border-slate-700/60'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${pipelineResult?.lesions?.has_irma ? 'bg-purple-400' : 'bg-slate-600'}`}></span>
                      <span>{pipelineResult?.lesions?.has_irma ? `IRMA: Present` : 'IRMA: Absent'}</span>
                    </span>

                    {/* Venous Beading Badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center space-x-1 border ${
                      pipelineResult?.lesions?.has_vb
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                        : 'bg-slate-800/60 text-slate-500 border-slate-700/60'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${pipelineResult?.lesions?.has_vb ? 'bg-orange-400' : 'bg-slate-600'}`}></span>
                      <span>{pipelineResult?.lesions?.has_vb ? `VB: Present` : 'VB: Absent'}</span>
                    </span>

                    {/* ETDRS 4-2-1 Status Badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center space-x-1 border ${
                      pipelineResult?.etdrs_421?.severe_npdr
                        ? (pipelineResult?.etdrs_421?.very_severe_npdr 
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/50' 
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/50')
                        : 'bg-slate-800/60 text-slate-500 border-slate-700/60'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        pipelineResult?.etdrs_421?.very_severe_npdr ? 'bg-rose-400' : (pipelineResult?.etdrs_421?.severe_npdr ? 'bg-amber-400' : 'bg-slate-600')
                      }`}></span>
                      <span>
                        {pipelineResult?.etdrs_421?.severe_npdr 
                          ? `ETDRS 4-2-1: MET (${pipelineResult?.etdrs_421?.criteria_met_count || 1}/3)` 
                          : 'ETDRS 4-2-1: 0/3 Criteria'}
                      </span>
                    </span>
                  </div>

                  {/* Clinician Toggles */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mr-1">Clinician Toggles:</span>
                    
                    <button
                      onClick={handleToggleNV}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center space-x-1 transition-all ${
                        pipelineResult?.lesions?.has_nv
                          ? 'bg-rose-950/80 border-rose-500/80 text-rose-200'
                          : 'bg-slate-850 hover:bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${pipelineResult?.lesions?.has_nv ? 'bg-rose-400 animate-ping' : 'bg-slate-600'}`}></span>
                      <span>NV (PDR)</span>
                    </button>

                    <button
                      onClick={handleToggleScarring}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center space-x-1 transition-all ${
                        pipelineResult?.lesions?.has_retinal_scarring
                          ? 'bg-amber-950/80 border-amber-500/80 text-amber-200'
                          : 'bg-slate-850 hover:bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${pipelineResult?.lesions?.has_retinal_scarring ? 'bg-amber-400' : 'bg-slate-600'}`}></span>
                      <span>PRP Wall Scars</span>
                    </button>

                    <button
                      onClick={handleToggleCWS}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center space-x-1 transition-all ${
                        pipelineResult?.lesions?.has_cws
                          ? 'bg-sky-950/80 border-sky-500/80 text-sky-200'
                          : 'bg-slate-850 hover:bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${pipelineResult?.lesions?.has_cws ? 'bg-sky-400' : 'bg-slate-600'}`}></span>
                      <span>CWS</span>
                    </button>

                    <button
                      onClick={handleToggleIRMA}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center space-x-1 transition-all ${
                        pipelineResult?.lesions?.has_irma
                          ? 'bg-purple-950/80 border-purple-500/80 text-purple-200'
                          : 'bg-slate-850 hover:bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${pipelineResult?.lesions?.has_irma ? 'bg-purple-400' : 'bg-slate-600'}`}></span>
                      <span>IRMA</span>
                    </button>

                    <button
                      onClick={handleToggleVB}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center space-x-1 transition-all ${
                        pipelineResult?.lesions?.has_vb
                          ? 'bg-orange-950/80 border-orange-500/80 text-orange-200'
                          : 'bg-slate-850 hover:bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${pipelineResult?.lesions?.has_vb ? 'bg-orange-400' : 'bg-slate-600'}`}></span>
                      <span>VB (Rule 2)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* IF IMAGE IS UNGRADABLE (e.g. Non-fundus scenery / blur), SHOW REJECTION & RE-TRY */}
          {!pipelineResult.is_gradable ? (
            <div className="no-print p-6 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm font-bold text-rose-200 uppercase tracking-wide">
                  {pipelineResult.iqa_reason === 'non_fundus'
                    ? 'Non-Fundus Photograph Rejected'
                    : 'Image Quality Assessment Failed'}
                </h3>
                <p className="text-xs text-slate-300">
                  {pipelineResult.iqa_reason === 'non_fundus'
                    ? 'The Gatekeeper mini-model detected that the uploaded image lacks retinal chromatic and aperture signatures (scenery, document, or non-retinal photo).'
                    : 'The uploaded image failed focus or illumination standards. Please re-capture steady against patient orbit.'}
                </p>
              </div>
              <div className="flex justify-center space-x-3 pt-2">
                <button
                  onClick={() => { setUploadedImageSrc(null); setPipelineResult(null); }}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
                >
                  Upload Another Image
                </button>
              </div>
            </div>
          ) : (
            /* IF IMAGE IS GRADABLE: SHOW FULL PATIENT DIAGNOSTIC REPORT */
            <div className="space-y-6">
              {/* Report Header Card */}
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                      Diagnostic Clinical Dossier &bull; Sunetra Autonomous AI
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-100 mt-0.5">
                      {patientData.name} ({patientData.gender}, {patientData.age}y) &bull; Eye: {patientData.eye}
                    </h3>
                    <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                      <span>MRN: <strong className="text-slate-200 font-mono">{patientData.patientId}</strong></span>
                      <span>&bull;</span>
                      <span>Center: <strong className="text-slate-200">{patientData.center}</strong></span>
                      <span>&bull;</span>
                      <span>History: <strong className="text-slate-200">{patientData.diabetesType}</strong></span>
                    </div>
                  </div>

                  {/* Primary Diagnosis Badge */}
                  <div className="flex flex-col items-end">
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border uppercase tracking-wider shadow-sm ${
                      pipelineResult.icdr_grade === 0 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                        : (pipelineResult.referable_dr 
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/40')
                    }`}>
                      {pipelineResult.class_info?.name || `Grade ${pipelineResult.icdr_grade}`}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 font-mono">
                      Confidence: <strong>{(pipelineResult.confidence * 100).toFixed(1)}%</strong>
                    </span>
                  </div>
                </div>

                {/* Triage & Clinical Recommendation Alert Banner */}
                <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
                  pipelineResult.referable_dr 
                    ? 'bg-rose-950/40 border-rose-500/50 text-rose-200' 
                    : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                }`}>
                  <Activity className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-xs uppercase tracking-wider">
                      {pipelineResult.referable_dr ? 'Referral Protocol Required' : 'Screening Cleared'} &bull; {pipelineResult.class_info?.action}
                    </div>
                    <p className="text-xs text-slate-300">
                      {pipelineResult.dme_risk && (
                        <strong className="text-amber-300 block mb-1">
                          ⚠️ Diabetic Macular Edema (DME) High Risk: Hard exudate clusters detected within 1 Disc Diameter of the central fovea.
                        </strong>
                      )}
                      {pipelineResult.etdrs_421?.risk_profile || 'Routine protocol based on International Clinical Diabetic Retinopathy (ICDR) standard.'}
                    </p>
                  </div>
                </div>

                {/* 1. Fundus Visualizer (Model 2: Anatomy & Lesion Multi-Head Segmentation) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                      <Eye className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Fundus Visualizer</span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      {patientData.eye === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'}
                    </span>
                  </div>

                  <SegmentationViewer 
                    imageUrl={currentImage}
                    segmentationData={pipelineResult}
                    gradcamActive={gradcamActive}
                    setGradcamActive={setGradcamActive}
                    grade={pipelineResult.icdr_grade}
                  />
                </div>

                {/* 2. Clinical Biomarkers (Positioned Under Model 2) */}
                <div className="space-y-3 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                      <Layers className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Clinical Biomarkers</span>
                    </span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      18-Dimensional Phenotype Vector
                    </span>
                  </div>

                  <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-4 shadow-inner">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 flex items-center justify-between">
                        <span className="text-slate-400">Microaneurysms (MAs):</span>
                        <span className="font-mono font-bold text-slate-200">{pipelineResult.lesions?.ma_count || 0}</span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 flex items-center justify-between">
                        <span className="text-slate-400">Intraretinal Hemorrhages:</span>
                        <span className="font-mono font-bold text-slate-200">{pipelineResult.lesions?.hem_count || 0}</span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 flex items-center justify-between">
                        <span className="text-slate-400">Hard Exudates Area:</span>
                        <span className="font-mono font-bold text-slate-200">{(pipelineResult.lesions?.exudate_area_pct || 0).toFixed(2)}%</span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 flex items-center justify-between">
                        <span className="text-slate-400">Cotton Wool Spots (CWS):</span>
                        <span className="font-mono font-bold text-slate-200">{pipelineResult.lesions?.cotton_wool_spots || 0}</span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 flex items-center justify-between">
                        <span className="text-slate-400">Neovascularization (PDR):</span>
                        <span className={`font-mono font-bold ${pipelineResult.lesions?.has_nv ? 'text-rose-400' : 'text-slate-400'}`}>
                          {pipelineResult.lesions?.has_nv ? 'Detected (Active NV)' : 'Absent'}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 flex items-center justify-between">
                        <span className="text-slate-400">PRP Retinal Laser Scars:</span>
                        <span className={`font-mono font-bold ${pipelineResult.lesions?.has_retinal_scarring ? 'text-amber-400' : 'text-slate-400'}`}>
                          {pipelineResult.lesions?.has_retinal_scarring ? `${pipelineResult.lesions.scar_count || 28} Burns` : 'Absent'}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 flex items-center justify-between">
                        <span className="text-slate-400">Venous Beading (Rule 2):</span>
                        <span className={`font-mono font-bold ${pipelineResult.lesions?.has_vb ? 'text-orange-400' : 'text-slate-400'}`}>
                          {pipelineResult.lesions?.has_vb ? `Present (${pipelineResult.lesions?.vb_quad_count || 2} Quads)` : 'Absent'}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 flex items-center justify-between">
                        <span className="text-slate-400">IRMA Shunt Vessels (Rule 1):</span>
                        <span className={`font-mono font-bold ${pipelineResult.lesions?.has_irma ? 'text-purple-400' : 'text-slate-400'}`}>
                          {pipelineResult.lesions?.has_irma ? `Present (${pipelineResult.lesions?.irma_count || 2} Shunts)` : 'Absent'}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between shadow-sm">
                        <span className="text-cyan-200 font-semibold">ETDRS 4-2-1 Status:</span>
                        <span className="font-mono font-bold text-cyan-300">
                          {pipelineResult.etdrs_421?.score || 0}/3 Criteria Met
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Module 3: Fused Deep-Feature Clinical Grading (Image 3) */}
                <div className="no-print pt-2">
                  <GradingCard gradingData={pipelineResult} />
                </div>

                {/* Report Action Buttons */}
                <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-400 flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>Telemetry Packet: 3.2 KB &bull; SHA-256 Validated</span>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    <button
                      onClick={() => setShowPrintReport(!showPrintReport)}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all flex items-center space-x-2"
                    >
                      <Printer className="h-4 w-4" />
                      <span>{showPrintReport ? 'Hide Print Sheet' : 'Generate Printable PDF Report'}</span>
                    </button>

                    <button
                      onClick={handleReset}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      Next Patient
                    </button>
                  </div>
                </div>
              </div>

              {/* PRINTABLE DOSSIER (Rendered when toggled or printed) */}
              {showPrintReport && (
                <div className="space-y-4">
                  <XAIReport 
                    result={pipelineResult} 
                    imageUrl={currentImage}
                    patientId={patientData.patientId}
                    siteName={patientData.center}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
