import React from 'react';
import { 
  FileText, 
  Printer, 
  AlertTriangle, 
  CheckCircle, 
  Send, 
  HardDrive, 
  MapPin,
  Calendar,
  User,
  Activity
} from 'lucide-react';

export default function XAIReport({ result, patientId = 'PAT-SIH-9024', siteName = 'PHC Block 4, Ratnagiri' }) {
  if (!result || result.short_circuited) return null;

  const {
    icdr_grade,
    class_info,
    confidence,
    referable_dr,
    dme_risk,
    lesions,
    anatomy,
    payload_size_kb,
    total_time_ms
  } = result;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-cyan-400" />
          <div>
            <h4 className="text-sm font-semibold text-slate-100">
              Module 4: Explainable AI & Clinician Triage Report
            </h4>
            <p className="text-xs text-slate-400">
              Standardized referral document with anatomical risk stratification
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition-all"
        >
          <Printer className="h-3.5 w-3.5" />
          <span>Print / Export Clinician PDF</span>
        </button>
      </div>

      {/* DME Risk Evaluation Banner */}
      <div className={`p-3.5 rounded-lg border flex items-start space-x-3 ${
        dme_risk 
          ? 'bg-amber-950/30 border-amber-500/50 text-amber-200' 
          : 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
      }`}>
        {dme_risk ? (
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xs uppercase tracking-wider">
              Diabetic Macular Edema (DME) Assessment:
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
              dme_risk ? 'bg-amber-500/30 text-amber-300' : 'bg-emerald-500/30 text-emerald-300'
            }`}>
              {dme_risk ? 'HIGH RISK (CLINICALLY SIGNIFICANT)' : 'LOW / NO DME RISK'}
            </span>
          </div>
          <p className="text-xs text-slate-300">
            {dme_risk 
              ? `Hard exudates detected at ${lesions.fovea_exudate_dist_dd} DD from fovea center (threshold <= 1.0 DD). Patient requires urgent OCT confirmation to prevent central vision loss.`
              : `No hard exudates encroaching within 1.0 disc diameter of the foveal avascular zone (distance: ${lesions.fovea_exudate_dist_dd} DD).`}
          </p>
        </div>
      </div>

      {/* Structured Telemedicine Packet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="text-slate-400 flex items-center space-x-1.5">
            <HardDrive className="h-3.5 w-3.5 text-cyan-400" />
            <span>Telemetry Payload</span>
          </div>
          <div className="text-base font-bold font-mono text-cyan-300">
            {payload_size_kb} KB
          </div>
          <div className="text-[10px] text-slate-500">
            Compressed JSON + Mask vectors (99.98% smaller than 15MB raw image)
          </div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="text-slate-400 flex items-center space-x-1.5">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span>Total Edge Compute Time</span>
          </div>
          <div className="text-base font-bold font-mono text-emerald-300">
            {total_time_ms} ms
          </div>
          <div className="text-[10px] text-slate-500">
            Jetson Orin Nano / ARM Cortex-A78 benchmarked
          </div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="text-slate-400 flex items-center space-x-1.5">
            <Send className="h-3.5 w-3.5 text-indigo-400" />
            <span>Triage Priority</span>
          </div>
          <div className={`text-base font-bold font-mono ${referable_dr ? 'text-rose-400' : 'text-emerald-400'}`}>
            {referable_dr ? 'PRIORITY 1 (REFER)' : 'ROUTINE (MONITOR)'}
          </div>
          <div className="text-[10px] text-slate-500">
            Dispatched automatically to District Specialist Queue
          </div>
        </div>
      </div>

      {/* Printable Sheet Component (Visible on print & in card) */}
      <div className="bg-white text-slate-900 p-5 rounded-xl border border-slate-200 shadow-sm print:m-0 print:border-none">
        <div className="flex justify-between items-start border-b border-slate-300 pb-3">
          <div>
            <div className="font-bold text-base tracking-tight text-slate-900 uppercase">
              AI Tele-Ophthalmology Screening Report
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Smart India Hackathon 2026 • SIH-DRS-V1
            </div>
          </div>
          <div className="text-right text-xs text-slate-600 font-mono">
            <div>Date: {new Date().toLocaleDateString()}</div>
            <div>Ref: {patientId}</div>
          </div>
        </div>

        {/* Patient & Facility details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 text-xs border-b border-slate-200 pb-3">
          <div>
            <span className="text-slate-500 block">Patient ID:</span>
            <span className="font-semibold text-slate-800">{patientId}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Primary Clinic:</span>
            <span className="font-semibold text-slate-800">{siteName}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Edge Hardware:</span>
            <span className="font-semibold text-slate-800">NVIDIA Orin Nano</span>
          </div>
          <div>
            <span className="text-slate-500 block">Transmission:</span>
            <span className="font-semibold text-slate-800">250 Kbps (Rural Uplink)</span>
          </div>
        </div>

        {/* Diagnostic Results Table */}
        <div className="my-3">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="p-2">Diagnostic Finding</th>
                <th className="p-2">Quantitative Metric</th>
                <th className="p-2">Clinical Classification</th>
                <th className="p-2">Action Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-2 font-medium">Diabetic Retinopathy Grade</td>
                <td className="p-2 font-mono">Grade {icdr_grade} (Conf: {(confidence * 100).toFixed(1)}%)</td>
                <td className="p-2 font-semibold text-slate-900">{class_info.name}</td>
                <td className="p-2">{class_info.action}</td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Macular Edema (DME) Risk</td>
                <td className="p-2 font-mono">Exudate Dist: {lesions.fovea_exudate_dist_dd} DD</td>
                <td className={`p-2 font-bold ${dme_risk ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {dme_risk ? 'POSITIVE (High Risk)' : 'NEGATIVE'}
                </td>
                <td className="p-2">{dme_risk ? 'Urgent Macular OCT Referral' : 'Routine Fundus Review'}</td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Microvascular Lesions</td>
                <td className="p-2 font-mono">MAs: {lesions.ma_count} | Hems: {lesions.hem_count}</td>
                <td className="p-2">Exudate: {lesions.exudate_area_pct}%</td>
                <td className="p-2">{lesions.has_nv ? 'Neovascularization (NV) Present' : 'No Active Neovascularization'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sign-off footer */}
        <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
          <div>
            Generated by AI Screening Core. Tele-ophthalmologist review mandatory for Grade &ge; 2 or DME positive cases.
          </div>
          <div className="font-mono text-slate-700">
            Sign-off: _________________________
          </div>
        </div>
      </div>
    </div>
  );
}
