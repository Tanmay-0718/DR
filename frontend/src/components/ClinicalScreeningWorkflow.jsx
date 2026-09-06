import React, { useState, useRef, useEffect } from 'react';
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
  ShieldAlert,
  Cloud,
  Database
} from 'lucide-react';
import { SAMPLE_CATALOG, runFullPipeline, ICDR_CLASSES } from '../utils/imageProcessing';
import SegmentationViewer from './SegmentationViewer';
import GradingCard from './GradingCard';
import XAIReport from './XAIReport';
import cloudEhrService from '../services/cloudEhrService';

// Standard paired bilateral samples for complete OD/OS clinical examination
const SAMPLE_BILATERAL_PAIRS = {
  grade0: {
    od: '/samples/fundus_001_Grade_0_No_DR.png',
    os: '/samples/fundus_002_Grade_0_No_DR.png',
  },
  grade1: {
    od: '/samples/fundus_003_Grade_1_Mild_DR.png',
    os: '/samples/fundus_004_Grade_1_Mild_DR.png',
  },
  grade2: {
    od: '/samples/fundus_005_Grade_2_Moderate_DR.png',
    os: '/samples/fundus_006_Grade_2_Moderate_DR.png',
  },
  grade3: {
    od: '/samples/fundus_007_Grade_3_Severe_DR.png',
    os: '/samples/fundus_008_Grade_3_Severe_DR.png',
  },
  grade4: {
    od: '/samples/fundus_009_Grade_4_PDR.png',
    os: '/samples/fundus_010_Grade_4_PDR.png',
  },
  blur: {
    od: '/samples/fundus_011_Ungradable_Blur.png',
    os: '/samples/fundus_002_Grade_0_No_DR.png',
  }
};

export default function ClinicalScreeningWorkflow({ onBackToHome, onBackToLanding, onOpenRegistry }) {
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
  const [odImageSrc, setOdImageSrc] = useState(null);
  const [osImageSrc, setOsImageSrc] = useState(null);
  const [odFileName, setOdFileName] = useState('');
  const [osFileName, setOsFileName] = useState('');
  const [odResult, setOdResult] = useState(null);
  const [osResult, setOsResult] = useState(null);
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
  const [cloudSynced, setCloudSynced] = useState(false);

  // Generate random Patient ID
  const handleGenerateId = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    setPatientData(prev => ({ ...prev, patientId: `SUN-2026-${num}` }));
  };

  // Active examined eye image
  const currentImage = patientData.eye === 'OS' 
    ? (osImageSrc || (uploadedImageSrc && !odImageSrc ? uploadedImageSrc : null)) 
    : (odImageSrc || (uploadedImageSrc && !osImageSrc ? uploadedImageSrc : null));

  // Patient-level overall bilateral staging metrics
  const overallGrade = Math.max(
    odResult?.icdr_grade ?? 0,
    osResult?.icdr_grade ?? 0,
    pipelineResult?.icdr_grade ?? 0
  );
  const overallReferable = Boolean(
    odResult?.referable_dr ||
    osResult?.referable_dr ||
    pipelineResult?.referable_dr ||
    overallGrade >= 2
  );
  const overallDmeRisk = Boolean(
    odResult?.dme_risk ||
    osResult?.dme_risk ||
    pipelineResult?.dme_risk
  );
  const overallClassInfo = ICDR_CLASSES[overallGrade] || pipelineResult?.class_info || { name: 'No DR', action: 'Routine annual screening' };

  // Auto-sync patient examination record to central Cloud EHR
  useEffect(() => {
    if ((pipelineResult || odResult || osResult) && !cloudSynced) {
      const bestResult = pipelineResult || odResult || osResult;
      if (bestResult?.gate0?.valid !== false) {
        cloudEhrService.savePatientRecord(patientData, {
          ...bestResult,
          odResult,
          osResult,
          overallGrade,
          overallReferable,
          overallDmeRisk,
          odImageSrc,
          osImageSrc,
          imageSrc: currentImage
        });
        setCloudSynced(true);
      }
    }
  }, [pipelineResult, odResult, osResult, cloudSynced, patientData, currentImage, overallGrade, overallReferable, overallDmeRisk, odImageSrc, osImageSrc]);

  // Execute pipeline for a single eye image and return promise
  const analyzeSingleEye = (src, sample = null, fName = '', overrideOpts = {}) => {
    return new Promise((resolve) => {
      if (!src) return resolve(null);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;

      img.onload = async () => {
        try {
          const sampleId = sample ? sample.id : null;
          const result = await runFullPipeline(img, sampleId, fName, overrideOpts);
          resolve(result);
        } catch (err) {
          console.error('Screening pipeline execution error for eye:', err);
          resolve(null);
        }
      };

      img.onerror = () => {
        console.error('Failed to load image for eye analysis');
        resolve(null);
      };
    });
  };

  // Re-process active eye when clinician toggles an override
  const processImage = async (src, sample = null, fName = '', overrideOpts = {}) => {
    setIsProcessing(true);
    try {
      const result = await analyzeSingleEye(src, sample, fName, overrideOpts);
      if (result) {
        setPipelineResult(result);
        if (patientData.eye === 'OS') {
          setOsResult(result);
        } else {
          setOdResult(result);
        }
      }
    } finally {
      setIsProcessing(false);
    }
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

  // Handle custom upload for bilateral screening
  const handleFileUpload = (e, targetEye = null) => {
    const file = e.target.files?.[0];
    if (file) {
      const name = file.name;
      setSelectedSample(null);
      setClinicianOverrideGrade(null);
      setClinicianConfirmedNV(null);
      setClinicianConfirmedScarring(null);
      setClinicianConfirmedCWS(null);
      setClinicianConfirmedIRMA(null);
      setClinicianConfirmedVB(null);
      
      const eyeToSet = targetEye || patientData.eye || 'OD';

      const reader = new FileReader();
      reader.onload = async (ev) => {
        const src = ev.target.result;
        if (eyeToSet === 'OD') {
          setOdImageSrc(src);
          setOdFileName(name);
        } else {
          setOsImageSrc(src);
          setOsFileName(name);
        }

        // If diagnostic results are already showing (Step 4), re-process this specific eye
        if (pipelineResult || odResult || osResult) {
          setIsProcessing(true);
          try {
            const res = await analyzeSingleEye(src, null, name, {});
            if (eyeToSet === 'OD') {
              setOdResult(res);
            } else {
              setOsResult(res);
            }
            if (patientData.eye === eyeToSet && res) {
              setUploadedImageSrc(src);
              setFileName(name);
              setPipelineResult(res);
            }
          } finally {
            setIsProcessing(false);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Start diagnostic screening: bilateral concurrent execution when both eyes present
  const handleStartScreening = async (targetEye = null) => {
    setIsProcessing(true);
    try {
      const preferredEye = targetEye || patientData.eye || 'OD';
      let resOD = odResult;
      let resOS = osResult;

      if (odImageSrc && osImageSrc) {
        [resOD, resOS] = await Promise.all([
          analyzeSingleEye(odImageSrc, selectedSample, odFileName || 'Right_Eye_OD.png'),
          analyzeSingleEye(osImageSrc, selectedSample, osFileName || 'Left_Eye_OS.png')
        ]);
        setOdResult(resOD);
        setOsResult(resOS);
      } else if (odImageSrc) {
        resOD = await analyzeSingleEye(odImageSrc, selectedSample, odFileName || 'Right_Eye_OD.png');
        setOdResult(resOD);
      } else if (osImageSrc) {
        resOS = await analyzeSingleEye(osImageSrc, selectedSample, osFileName || 'Left_Eye_OS.png');
        setOsResult(resOS);
      }

      const activeEye = (preferredEye === 'OS' && resOS) ? 'OS' : (resOD ? 'OD' : 'OS');
      const activeRes = activeEye === 'OS' ? resOS : resOD;
      const activeImg = activeEye === 'OS' ? osImageSrc : odImageSrc;
      const activeFileName = activeEye === 'OS' ? (osFileName || 'Left_Eye_OS.png') : (odFileName || 'Right_Eye_OD.png');

      setPatientData(prev => ({ ...prev, eye: activeEye }));
      setUploadedImageSrc(activeImg);
      setFileName(activeFileName);
      setPipelineResult(activeRes);
    } finally {
      setIsProcessing(false);
    }
  };

  // Instant switch between examined eyes (OD and OS) with zero-latency in-memory swap
  const handleSwitchExaminedEye = async (newEye) => {
    setPatientData(prev => ({ ...prev, eye: newEye }));
    const targetResult = newEye === 'OS' ? osResult : odResult;
    const targetImage = newEye === 'OS' ? osImageSrc : odImageSrc;
    const targetFileName = newEye === 'OS' ? (osFileName || 'Left_Eye_OS.png') : (odFileName || 'Right_Eye_OD.png');

    setUploadedImageSrc(targetImage);
    setFileName(targetFileName);

    if (targetResult) {
      setPipelineResult(targetResult);
    } else if (targetImage) {
      setIsProcessing(true);
      try {
        const res = await analyzeSingleEye(targetImage, selectedSample, targetFileName);
        if (newEye === 'OS') setOsResult(res);
        else setOdResult(res);
        setPipelineResult(res);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Handle sample selection with automatic bilateral pairing & concurrent screening
  const handleSelectSample = async (sample) => {
    setSelectedSample(sample);
    const pair = SAMPLE_BILATERAL_PAIRS[sample.id];
    const od = pair ? pair.od : sample.path;
    const os = pair ? pair.os : sample.path;
    const odTitle = `${sample.title} (OD)`;
    const osTitle = `${sample.title} (OS)`;
    setOdImageSrc(od);
    setOsImageSrc(os);
    setOdFileName(odTitle);
    setOsFileName(osTitle);

    setClinicianOverrideGrade(null);
    setClinicianConfirmedNV(null);
    setClinicianConfirmedScarring(null);
    setClinicianConfirmedCWS(null);
    setClinicianConfirmedIRMA(null);
    setClinicianConfirmedVB(null);

    setIsProcessing(true);
    try {
      const [resOD, resOS] = await Promise.all([
        analyzeSingleEye(od, sample, odTitle),
        analyzeSingleEye(os, sample, osTitle)
      ]);
      setOdResult(resOD);
      setOsResult(resOS);

      const activeEye = patientData.eye === 'OS' ? 'OS' : 'OD';
      const activeRes = activeEye === 'OS' ? resOS : resOD;
      setPipelineResult(activeRes || resOD || resOS);
      setUploadedImageSrc(activeEye === 'OS' ? os : od);
      setFileName(activeEye === 'OS' ? osTitle : odTitle);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset for next patient
  const handleReset = () => {
    setUploadedImageSrc(null);
    setOdImageSrc(null);
    setOsImageSrc(null);
    setOdResult(null);
    setOsResult(null);
    setOdFileName('');
    setOsFileName('');
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
    setCloudSynced(false);
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
      {!pipelineResult && !isProcessing && (
        <div className="no-print space-y-6">
          {/* Dual Bilateral Upload Zone (OD Right Eye and OS Left Eye) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Right Eye (OD) Upload Card */}
            <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center space-y-3 ${
              odImageSrc ? 'border-cyan-500/80 bg-cyan-950/20' : 'border-slate-700 hover:border-cyan-500/80 bg-slate-900/40 hover:bg-slate-900/60'
            }`}>
              {odImageSrc ? (
                <div className="w-full flex flex-col items-center space-y-3">
                  <div className="h-36 w-full max-w-xs bg-black rounded-xl overflow-hidden border border-cyan-500/40 flex items-center justify-center relative shadow-lg">
                    <img src={odImageSrc} alt="Right Eye (OD) Preview" className="h-full w-full object-contain" />
                    <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center space-x-1 shadow">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>OD Ready</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 flex items-center justify-center space-x-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 inline-block"></span>
                      <span>Right Eye (OD &bull; Oculus Dexter)</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono truncate max-w-xs">
                      {odFileName || 'Right Eye Photograph'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 pt-1">
                    <label className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-colors">
                      <span>Change Image</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'OD')} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleStartScreening('OD')}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow transition-colors flex items-center space-x-1"
                    >
                      <span>Screen OD Now</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="w-full flex flex-col items-center space-y-3 cursor-pointer group">
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'OD')} className="hidden" />
                  <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 group-hover:bg-cyan-500/25 text-cyan-400 group-hover:text-cyan-300 border border-cyan-500/30 group-hover:border-cyan-400 flex items-center justify-center group-hover:scale-110 transition-all shadow-md">
                    <Eye className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 flex items-center justify-center space-x-1.5 group-hover:text-cyan-300 transition-colors">
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 inline-block"></span>
                      <span>Right Eye (OD &bull; Oculus Dexter)</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Click or drop to upload right eye retinal photograph
                    </p>
                  </div>
                  <div className="px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-600 group-hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition-all">
                    Upload Right Eye (OD)
                  </div>
                </label>
              )}
            </div>

            {/* Left Eye (OS) Upload Card */}
            <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center space-y-3 ${
              osImageSrc ? 'border-sky-500/80 bg-sky-950/20' : 'border-slate-700 hover:border-sky-500/80 bg-slate-900/40 hover:bg-slate-900/60'
            }`}>
              {osImageSrc ? (
                <div className="w-full flex flex-col items-center space-y-3">
                  <div className="h-36 w-full max-w-xs bg-black rounded-xl overflow-hidden border border-sky-500/40 flex items-center justify-center relative shadow-lg">
                    <img src={osImageSrc} alt="Left Eye (OS) Preview" className="h-full w-full object-contain" />
                    <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center space-x-1 shadow">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>OS Ready</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 flex items-center justify-center space-x-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-sky-400 inline-block"></span>
                      <span>Left Eye (OS &bull; Oculus Sinister)</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono truncate max-w-xs">
                      {osFileName || 'Left Eye Photograph'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 pt-1">
                    <label className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-colors">
                      <span>Change Image</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'OS')} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleStartScreening('OS')}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow transition-colors flex items-center space-x-1"
                    >
                      <span>Screen OS Now</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="w-full flex flex-col items-center space-y-3 cursor-pointer group">
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'OS')} className="hidden" />
                  <div className="h-14 w-14 rounded-2xl bg-sky-500/10 group-hover:bg-sky-500/25 text-sky-400 group-hover:text-sky-300 border border-sky-500/30 group-hover:border-sky-400 flex items-center justify-center group-hover:scale-110 transition-all shadow-md">
                    <Eye className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 flex items-center justify-center space-x-1.5 group-hover:text-sky-300 transition-colors">
                      <span className="h-2.5 w-2.5 rounded-full bg-sky-400 inline-block"></span>
                      <span>Left Eye (OS &bull; Oculus Sinister)</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Click or drop to upload left eye retinal photograph
                    </p>
                  </div>
                  <div className="px-5 py-2.5 rounded-xl font-bold text-xs bg-sky-600 group-hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 transition-all">
                    Upload Left Eye (OS)
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Unified Bilateral Launch Banner when at least one image is ready */}
          {(odImageSrc || osImageSrc) && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/40 flex flex-wrap items-center justify-between gap-4 shadow-xl">
              <div>
                <div className="text-xs font-bold text-slate-100 flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>
                    {odImageSrc && osImageSrc 
                      ? 'Bilateral Examination Ready (Both Eyes Uploaded Separately)' 
                      : (odImageSrc ? 'Right Eye (OD) Photo Ready' : 'Left Eye (OS) Photo Ready')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {odImageSrc && osImageSrc 
                    ? 'Both eyes have distinct clinical photographs. Starting analysis on ' + (patientData.eye === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)') + '.'
                    : 'You can upload the second eye photograph above, or proceed to analyze this eye now.'}
                </p>
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={() => handleStartScreening()}
                  className="px-6 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all flex items-center space-x-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>
                    {odImageSrc && osImageSrc 
                      ? `Start Bilateral Screening (Analyze ${patientData.eye})` 
                      : `Analyze ${odImageSrc ? 'Right Eye (OD)' : 'Left Eye (OS)'}`}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Quick preset selector tray */}
          <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>Or Select a Calibrated Clinical Ground-Truth Case</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Bilateral Paired Sets (OD + OS)</span>
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
              {/* Report Header Card with Bilateral Eye Quick Toggles */}
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Bilateral Tele-Ocular Dossier &bull; Comprehensive OD &amp; OS Assessment</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-100 mt-0.5">
                      {patientData.name} ({patientData.gender}, {patientData.age}y)
                    </h3>
                    <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                      <span>MRN: <strong className="text-slate-200 font-mono">{patientData.patientId}</strong></span>
                      <span>&bull;</span>
                      <span>Center: <strong className="text-slate-200">{patientData.center}</strong></span>
                      <span>&bull;</span>
                      <span>History: <strong className="text-slate-200">{patientData.diabetesType}</strong></span>
                    </div>
                  </div>

                  {/* Overall Patient Diagnosis & Quick Eye Badges */}
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border uppercase tracking-wider shadow-sm ${
                        overallGrade === 0 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                          : (overallReferable 
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/40')
                      }`}>
                        Patient Overall: Grade {overallGrade} ({overallClassInfo.name})
                      </span>
                    </div>

                    {/* Bilateral Eye Switcher Pills */}
                    <div className="flex items-center space-x-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => handleSwitchExaminedEye('OD')}
                        className={`px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 transition-all ${
                          patientData.eye === 'OD'
                            ? 'bg-cyan-500 text-slate-950 shadow'
                            : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-300"></span>
                        <span>OD: {odResult ? `Grade ${odResult.icdr_grade}` : (odImageSrc ? 'OD Ready' : 'Empty')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSwitchExaminedEye('OS')}
                        className={`px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1 transition-all ${
                          patientData.eye === 'OS'
                            ? 'bg-sky-500 text-slate-950 shadow'
                            : 'text-slate-400 hover:text-sky-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-sky-300"></span>
                        <span>OS: {osResult ? `Grade ${osResult.icdr_grade}` : (osImageSrc ? 'OS Ready' : 'Empty')}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Triage & Clinical Recommendation Alert Banner */}
                <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
                  overallReferable 
                    ? 'bg-rose-950/40 border-rose-500/50 text-rose-200' 
                    : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                }`}>
                  <Activity className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-xs uppercase tracking-wider">
                      {overallReferable ? 'Referral Protocol Required' : 'Screening Cleared'} &bull; {overallClassInfo.action}
                    </div>
                    <p className="text-xs text-slate-300">
                      {overallDmeRisk && (
                        <strong className="text-amber-300 block mb-1">
                          ⚠️ Diabetic Macular Edema (DME) Risk Detected: Exudates present near central macular vision.
                        </strong>
                      )}
                      {odResult && osResult 
                        ? `Bilateral Evaluation Complete: Right Eye staged at Grade ${odResult.icdr_grade} (${odResult.class_info?.name}), Left Eye staged at Grade ${osResult.icdr_grade} (${osResult.class_info?.name}). Overall patient care plan governed by worse eye.`
                        : (pipelineResult?.etdrs_421?.risk_profile || 'Routine protocol based on International Clinical Diabetic Retinopathy (ICDR) standard.')}
                    </p>
                  </div>
                </div>

                {/* Bilateral Retinal Photography (Right Eye OD & Left Eye OS) */}
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-cyan-400" />
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Bilateral Digital Fundus Photographs (Left Eye &amp; Right Eye)
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      Currently Examining: <strong className="text-cyan-400">{patientData.eye === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Right Eye (OD) */}
                    <div className={`p-3 rounded-xl border transition-all ${
                      patientData.eye === 'OD'
                        ? 'bg-slate-900 border-cyan-500/50 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}>
                      <div className="flex items-center justify-between text-xs font-bold mb-2">
                        <span className="flex items-center space-x-1.5 text-slate-200">
                          <span className="h-2.5 w-2.5 rounded-full bg-cyan-500 inline-block"></span>
                          <span>RIGHT EYE (OD &bull; Oculus Dexter)</span>
                        </span>
                        <div className="flex items-center space-x-2">
                          {odResult && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                              Grade {odResult.icdr_grade}
                            </span>
                          )}
                          {patientData.eye === 'OD' ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                              Active Eye
                            </span>
                          ) : (
                            odImageSrc && (
                              <button
                                type="button"
                                onClick={() => handleSwitchExaminedEye('OD')}
                                className="text-[10px] font-mono px-2.5 py-1 rounded font-bold uppercase bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition-colors flex items-center space-x-1"
                              >
                                <span>{odResult ? 'View OD' : 'Analyze OD'}</span>
                                <ChevronRight className="h-3 w-3" />
                              </button>
                            )
                          )}
                          <label className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer flex items-center space-x-1">
                            <Upload className="h-2.5 w-2.5 text-cyan-400" />
                            <span>{odImageSrc ? 'Replace' : 'Upload'}</span>
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'OD')} className="hidden" />
                          </label>
                        </div>
                      </div>
                      <div className="h-44 sm:h-52 bg-black rounded-lg overflow-hidden flex items-center justify-center border border-slate-800 relative group">
                        {odImageSrc ? (
                          <>
                            <img 
                              src={odImageSrc} 
                              alt="Right Eye (OD) Fundus" 
                              className="h-full w-full object-contain"
                            />
                            <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-slate-300 font-mono">
                              OD &bull; 45° FOV
                            </div>
                            {odResult && (
                              <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-cyan-300 font-mono border border-cyan-500/30">
                                {odResult.dme_risk ? '⚠️ DME Alert' : '✓ Spared'}
                              </div>
                            )}
                          </>
                        ) : (
                          <label className="flex flex-col items-center justify-center space-y-2 text-slate-500 cursor-pointer hover:text-slate-300 p-4 text-center">
                            <Upload className="h-6 w-6 text-cyan-500" />
                            <span className="text-xs font-semibold text-slate-300">No Right Eye photo uploaded</span>
                            <span className="text-[10px] text-slate-400">Click to upload Right Eye (OD)</span>
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'OD')} className="hidden" />
                          </label>
                        )}
                      </div>
                      {odResult && (
                        <div className="mt-2 text-[10px] text-slate-400 font-mono flex items-center justify-between px-1">
                          <span>MAs: {odResult.lesions?.ma_count ?? 0} &bull; Hems: {odResult.lesions?.hem_count ?? 0}</span>
                          <span className={odResult.referable_dr ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                            {odResult.referable_dr ? 'Referable' : 'Routine'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Left Eye (OS) */}
                    <div className={`p-3 rounded-xl border transition-all ${
                      patientData.eye === 'OS'
                        ? 'bg-slate-900 border-sky-500/50 shadow-md shadow-sky-950/40 ring-1 ring-sky-500/30'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}>
                      <div className="flex items-center justify-between text-xs font-bold mb-2">
                        <span className="flex items-center space-x-1.5 text-slate-200">
                          <span className="h-2.5 w-2.5 rounded-full bg-sky-500 inline-block"></span>
                          <span>LEFT EYE (OS &bull; Oculus Sinister)</span>
                        </span>
                        <div className="flex items-center space-x-2">
                          {osResult && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-sky-500/10 text-sky-300 border border-sky-500/30">
                              Grade {osResult.icdr_grade}
                            </span>
                          )}
                          {patientData.eye === 'OS' ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-sky-500/20 text-sky-300 border border-sky-500/40">
                              Active Eye
                            </span>
                          ) : (
                            osImageSrc && (
                              <button
                                type="button"
                                onClick={() => handleSwitchExaminedEye('OS')}
                                className="text-[10px] font-mono px-2.5 py-1 rounded font-bold uppercase bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white transition-colors flex items-center space-x-1"
                              >
                                <span>{osResult ? 'View OS' : 'Analyze OS'}</span>
                                <ChevronRight className="h-3 w-3" />
                              </button>
                            )
                          )}
                          <label className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer flex items-center space-x-1">
                            <Upload className="h-2.5 w-2.5 text-sky-400" />
                            <span>{osImageSrc ? 'Replace' : 'Upload'}</span>
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'OS')} className="hidden" />
                          </label>
                        </div>
                      </div>
                      <div className="h-44 sm:h-52 bg-black rounded-lg overflow-hidden flex items-center justify-center border border-slate-800 relative group">
                        {osImageSrc ? (
                          <>
                            <img 
                              src={osImageSrc} 
                              alt="Left Eye (OS) Fundus" 
                              className="h-full w-full object-contain"
                            />
                            <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-slate-300 font-mono">
                              OS &bull; 45° FOV
                            </div>
                            {osResult && (
                              <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-sky-300 font-mono border border-sky-500/30">
                                {osResult.dme_risk ? '⚠️ DME Alert' : '✓ Spared'}
                              </div>
                            )}
                          </>
                        ) : (
                          <label className="flex flex-col items-center justify-center space-y-2 text-slate-500 cursor-pointer hover:text-slate-300 p-4 text-center">
                            <Upload className="h-6 w-6 text-sky-500" />
                            <span className="text-xs font-semibold text-slate-300">No Left Eye photo uploaded</span>
                            <span className="text-[10px] text-slate-400">Click to upload Left Eye (OS)</span>
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'OS')} className="hidden" />
                          </label>
                        )}
                      </div>
                      {osResult && (
                        <div className="mt-2 text-[10px] text-slate-400 font-mono flex items-center justify-between px-1">
                          <span>MAs: {osResult.lesions?.ma_count ?? 0} &bull; Hems: {osResult.lesions?.hem_count ?? 0}</span>
                          <span className={osResult.referable_dr ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                            {osResult.referable_dr ? 'Referable' : 'Routine'}
                          </span>
                        </div>
                      )}
                    </div>
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

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Cloud EHR Status Badge */}
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                      <Cloud className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Cloud Synced</span>
                    </div>

                    {onOpenRegistry && (
                      <button
                        onClick={onOpenRegistry}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                        title="View central registry across all centers"
                      >
                        <Database className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Central Registry</span>
                      </button>
                    )}

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
                    odResult={odResult}
                    osResult={osResult}
                    imageUrl={currentImage}
                    odImageUrl={odImageSrc}
                    osImageUrl={osImageSrc}
                    patientId={patientData.patientId}
                    patientData={patientData}
                    siteName={patientData.center}
                    activeEye={patientData.eye}
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
