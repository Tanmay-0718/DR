import React, { useState, useEffect, useMemo } from 'react';
import {
  Cloud,
  Search,
  Filter,
  Building2,
  Calendar,
  Eye,
  User,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Settings,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  X,
  FileJson,
  ShieldCheck,
  Server,
  Zap,
  Copy,
  Check
} from 'lucide-react';
import cloudEhrService, { NETWORK_CENTERS } from '../services/cloudEhrService';

export default function CloudPatientRegistry({ onNavigateToScreening, onSelectPatientForScreening }) {
  // Records & Search States
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCenter, setSelectedCenter] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedEye, setSelectedEye] = useState('all');
  const [selectedReferral, setSelectedReferral] = useState('all');

  // Selected Record for Dossier Slide-Over
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [copiedJson, setCopiedJson] = useState(false);

  // Cloud Config Modal State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [cloudConfig, setCloudConfig] = useState(cloudEhrService.getCloudConfig());
  const [testResult, setTestResult] = useState(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Load records
  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await cloudEhrService.fetchPatientRecords({
        query: searchQuery,
        centerId: selectedCenter,
        icdrGrade: selectedGrade,
        examinedEye: selectedEye,
        referralStatus: selectedReferral
      });
      setRecords(data);
    } catch (err) {
      console.error('Failed to load patient records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, selectedCenter, selectedGrade, selectedEye, selectedReferral]);

  // Network stats
  const stats = useMemo(() => {
    return cloudEhrService.getNetworkStatistics();
  }, [records]);

  // Handle Cloud Config Save
  const handleSaveConfig = (e) => {
    e.preventDefault();
    cloudEhrService.saveCloudConfig(cloudConfig);
    setIsConfigModalOpen(false);
    loadData();
  };

  // Test Cloud Connection
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);
    try {
      const res = await cloudEhrService.testCloudConnection(cloudConfig);
      setTestResult(res);
    } catch (err) {
      setTestResult({
        success: false,
        status: 'Error',
        latencyMs: 0,
        message: err.message || 'Unknown network error'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Export FHIR Bundle
  const handleExportFhir = () => {
    const bundle = cloudEhrService.exportRecordsAsFHIR(records);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Chakshuh_FHIR_R4_Patient_Registry_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Copy JSON telemetry
  const handleCopyJson = (obj) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Helper for grade styling
  const getGradeBadge = (grade, label) => {
    switch (grade) {
      case 0:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Grade 0 • No DR
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/30">
            Grade 1 • Mild NPDR
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Grade 2 • Moderate
          </span>
        );
      case 3:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/30">
            Grade 3 • Severe NPDR
          </span>
        );
      case 4:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold">
            Grade 4 • Proliferative
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400">
            {label}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full filter blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
              <Cloud className="h-3.5 w-3.5" />
              <span>Multi-Center Tele-Ophthalmology Grid &bull; Cloud EHR</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              Central Cloud Patient Registry
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Real-time synchronization across rural Primary Health Centers (PHCs), mobile screening vans, and district hospital specialist hubs with open cloud adapter hooks.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 flex items-center space-x-1.5 transition-all shadow-sm"
              title="Configure custom cloud REST or FHIR endpoint"
            >
              <Settings className="h-3.5 w-3.5 text-cyan-400" />
              <span>Cloud Services Config</span>
            </button>

            <button
              onClick={handleExportFhir}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 flex items-center space-x-1.5 transition-all shadow-sm"
              title="Download HL7 FHIR R4 Bundle for national health stack integration"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span>Export FHIR JSON</span>
            </button>

            {onNavigateToScreening && (
              <button
                onClick={onNavigateToScreening}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 flex items-center space-x-1.5 transition-all"
              >
                <Activity className="h-3.5 w-3.5" />
                <span>New Patient Screening</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Cloud Status Ticker */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-emerald-400 font-semibold">
              Cloud Gateway Online
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-slate-400 font-mono text-[11px]">
              Provider: <strong className="text-slate-200 uppercase">{cloudConfig.provider}</strong>
            </span>
            <span className="text-slate-600 hidden sm:inline">&bull;</span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">
              Endpoint: <code className="text-cyan-300 font-mono text-[10px]">{cloudConfig.endpointUrl}</code>
            </span>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>ABDM FHIR R4 Ready</span>
          </div>
        </div>
      </div>

      {/* Network Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Total Patient Records</div>
          <div className="text-2xl font-black text-slate-100 mt-1">{stats.totalRecords}</div>
          <div className="text-[11px] text-emerald-400 flex items-center space-x-1 mt-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>100% Synced to Registry</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Connected Centers</div>
          <div className="text-2xl font-black text-cyan-400 mt-1">{stats.centersCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            PHCs, CHCs &amp; Mobile Vans
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Referable Cases (Grade &ge;2)</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{stats.referableCases}</div>
          <div className="text-[11px] text-amber-300/80 mt-1">
            {stats.referableRatePct}% of Screened Population
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Telemetry Data Volume</div>
          <div className="text-2xl font-black text-indigo-300 font-mono mt-1">{stats.totalTelemetryKb} KB</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Ultra-compact 3.2 KB / dossier
          </div>
        </div>
      </div>

      {/* Search & Filters Controls */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Patient Name, MRN ID (e.g. SUN-2026-0842), Phone, or Center..."
              className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Refresh */}
          <button
            onClick={loadData}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs flex items-center space-x-1.5 transition-colors border border-slate-700/60"
            title="Refresh database"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
          {/* Center Selector */}
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
              Filter by Center
            </label>
            <select
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500/50 text-xs"
            >
              {NETWORK_CENTERS.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Severity Grade Selector */}
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
              ICDR Severity Grade
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500/50 text-xs"
            >
              <option value="all">All Grades (0 - 4)</option>
              <option value="0">Grade 0: No DR</option>
              <option value="1">Grade 1: Mild NPDR</option>
              <option value="2">Grade 2: Moderate NPDR</option>
              <option value="3">Grade 3: Severe NPDR</option>
              <option value="4">Grade 4: Proliferative (PDR)</option>
            </select>
          </div>

          {/* Examined Eye Selector */}
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
              Examined Eye
            </label>
            <select
              value={selectedEye}
              onChange={(e) => setSelectedEye(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500/50 text-xs"
            >
              <option value="all">Both Eyes (OD &amp; OS)</option>
              <option value="OD">OD (Right Eye - Oculus Dexter)</option>
              <option value="OS">OS (Left Eye - Oculus Sinister)</option>
            </select>
          </div>

          {/* Referral Status Selector */}
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
              Referral Protocol
            </label>
            <select
              value={selectedReferral}
              onChange={(e) => setSelectedReferral(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500/50 text-xs"
            >
              <option value="all">All Referral Tiers</option>
              <option value="referable">Referable Only (Grade &ge; 2)</option>
              <option value="urgent">Urgent / Critical (Grade &ge; 3)</option>
              <option value="non-referable">Non-Referable (Routine Follow-up)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm text-slate-100">Patient Screening Records</span>
            <span className="font-mono text-xs text-slate-400">({records.length} matching)</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Click any patient row to inspect full clinical biomarker audit dossier
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <RefreshCw className="h-6 w-6 animate-spin text-cyan-400 mx-auto" />
            <p className="text-xs">Querying central multi-center registry...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto" />
            <p className="font-medium text-slate-200 text-sm">No patient records match the current search filters</p>
            <p className="text-xs text-slate-500">Try broadening your search query or reset center / grade filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCenter('all');
                setSelectedGrade('all');
                setSelectedEye('all');
                setSelectedReferral('all');
              }}
              className="mt-2 px-3 py-1.5 rounded-lg bg-slate-800 text-cyan-400 hover:bg-slate-700 text-xs font-semibold"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Patient MRN / Name</th>
                  <th className="py-3 px-3">Eye</th>
                  <th className="py-3 px-4">Center / Location</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-4">Diagnosis (ICDR)</th>
                  <th className="py-3 px-4">ETDRS 4-2-1 Rule</th>
                  <th className="py-3 px-4">Referral Protocol</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {records.map((rec) => (
                  <tr
                    key={rec.id}
                    onClick={() => setSelectedPatient(rec)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {rec.name}
                      </div>
                      <div className="font-mono text-[11px] text-slate-400 mt-0.5 flex items-center space-x-2">
                        <span className="text-cyan-400 font-semibold">{rec.patientId}</span>
                        <span>&bull;</span>
                        <span>{rec.gender}, {rec.age}y</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-xs font-bold ${
                          rec.examinedEye === 'OD'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        }`}
                        title={rec.examinedEye === 'OD' ? 'Oculus Dexter (Right Eye)' : 'Oculus Sinister (Left Eye)'}
                      >
                        {rec.examinedEye}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate">
                      <div className="font-medium text-slate-200 truncate">{rec.centerName}</div>
                      <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                        <Building2 className="h-3 w-3 text-slate-500" />
                        <span>{rec.attendingClinician}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(rec.examDate).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getGradeBadge(rec.icdrGrade, rec.icdrLabel)}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="text-[11px] text-slate-300 font-medium truncate">
                        {rec.etdrsStatus}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 flex items-center space-x-2 mt-0.5">
                        <span>MA: {rec.biomarkers.maCount}</span>
                        <span>Hems: {rec.biomarkers.hemCount}</span>
                        {rec.biomarkers.nvDetected && <span className="text-rose-400 font-bold">NV+</span>}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className={`text-xs font-medium ${
                        rec.icdrGrade >= 3 ? 'text-rose-400 font-bold' : rec.icdrGrade === 2 ? 'text-amber-300' : 'text-slate-300'
                      }`}>
                        {rec.referralUrgency}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPatient(rec);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 group-hover:bg-cyan-500/20 text-slate-300 group-hover:text-cyan-300 border border-slate-700 group-hover:border-cyan-500/40 text-xs flex items-center space-x-1 transition-all ml-auto"
                      >
                        <span>Dossier</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SLIDE-OVER PATIENT CLINICAL DOSSIER DRAWER                                */}
      {/* ========================================================================= */}
      {selectedPatient && (
        <div className="fixed inset-0 z-[1000000] flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full overflow-y-auto drawer-slide-in"
            role="dialog"
            aria-modal="true"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 text-[10px] font-mono uppercase text-cyan-400">
                  <Activity className="h-3.5 w-3.5" />
                  <span>Clinical Patient Dossier &bull; Cloud Record</span>
                </div>
                <h2 className="text-lg font-black text-slate-100 mt-0.5">
                  {selectedPatient.name} &bull; {selectedPatient.patientId}
                </h2>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 space-y-6 flex-1 text-xs">
              {/* Primary Diagnostic Banner */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Primary Retinopathy Diagnosis</span>
                  <div className="text-lg font-black text-slate-100 mt-0.5">
                    {selectedPatient.icdrLabel} (Grade {selectedPatient.icdrGrade})
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Calibrated Confidence: <strong className="text-cyan-400 font-mono">{selectedPatient.confidencePct}%</strong>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Examined Eye</span>
                  <div className="mt-0.5">
                    <span className="px-3 py-1 rounded-lg text-xs font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      {selectedPatient.examinedEye === 'OD' ? 'OD (Right Eye - Oculus Dexter)' : 'OS (Left Eye - Oculus Sinister)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Demographics & Clinical Setting */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Age &amp; Gender</span>
                  <div className="font-semibold text-slate-200 mt-1">{selectedPatient.gender}, {selectedPatient.age} Years</div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Diabetes History</span>
                  <div className="font-semibold text-slate-200 mt-1">{selectedPatient.diabetesType}</div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Contact Phone</span>
                  <div className="font-mono text-slate-200 mt-1">{selectedPatient.contact}</div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 col-span-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Screening Center</span>
                  <div className="font-medium text-slate-200 mt-1">{selectedPatient.centerName}</div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Attending Clinician</span>
                  <div className="font-medium text-slate-200 mt-1">{selectedPatient.attendingClinician}</div>
                </div>
              </div>

              {/* ETDRS 4-2-1 Rule Staging Breakdown */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-slate-200 flex items-center space-x-1.5">
                    <Activity className="h-4 w-4 text-cyan-400" />
                    <span>ETDRS 4-2-1 Rule Clinical Stratification</span>
                  </span>
                  <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                    Rule Decision Engine
                  </span>
                </div>

                <div className="text-xs text-slate-300 font-medium">
                  {selectedPatient.etdrsStatus}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
                  <div className={`p-2 rounded-lg border ${selectedPatient.rule4Met ? 'bg-rose-950/40 border-rose-500/50 text-rose-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                    <div className="font-mono font-bold">Rule 4</div>
                    <div className="text-[9px] mt-0.5">4-Quad Hems</div>
                    <div className="text-xs font-bold mt-1">{selectedPatient.rule4Met ? 'MET' : 'NOT MET'}</div>
                  </div>

                  <div className={`p-2 rounded-lg border ${selectedPatient.rule2Met ? 'bg-rose-950/40 border-rose-500/50 text-rose-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                    <div className="font-mono font-bold">Rule 2</div>
                    <div className="text-[9px] mt-0.5">Venous Beading &ge;2Q</div>
                    <div className="text-xs font-bold mt-1">{selectedPatient.rule2Met ? 'MET' : 'NOT MET'}</div>
                  </div>

                  <div className={`p-2 rounded-lg border ${selectedPatient.rule1Met ? 'bg-rose-950/40 border-rose-500/50 text-rose-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                    <div className="font-mono font-bold">Rule 1</div>
                    <div className="text-[9px] mt-0.5">IRMA &ge;1Q</div>
                    <div className="text-xs font-bold mt-1">{selectedPatient.rule1Met ? 'MET' : 'NOT MET'}</div>
                  </div>
                </div>
              </div>

              {/* 18 Handcrafted Biomarkers Metric Table */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="font-bold text-slate-200">
                  Extracted Biomarkers (18-Dimensional Feature Space)
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Microaneurysms</span>
                    <strong className="text-slate-100 font-mono text-sm">{selectedPatient.biomarkers.maCount}</strong>
                  </div>

                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Hemorrhages</span>
                    <strong className="text-slate-100 font-mono text-sm">{selectedPatient.biomarkers.hemCount}</strong>
                  </div>

                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Exudate Area (%)</span>
                    <strong className="text-slate-100 font-mono text-sm">{selectedPatient.biomarkers.exudateAreaPct}%</strong>
                  </div>

                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Cotton Wool Spots</span>
                    <strong className="text-slate-100 font-mono text-sm">{selectedPatient.biomarkers.cwsCount}</strong>
                  </div>

                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Venous Beading Quads</span>
                    <strong className="text-slate-100 font-mono text-sm">{selectedPatient.biomarkers.vbQuadrants} / 4</strong>
                  </div>

                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">IRMA Quads</span>
                    <strong className="text-slate-100 font-mono text-sm">{selectedPatient.biomarkers.irmaQuadrants} / 4</strong>
                  </div>

                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Neovascularization</span>
                    <strong className={`font-mono text-sm ${selectedPatient.biomarkers.nvDetected ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {selectedPatient.biomarkers.nvDetected ? 'POSITIVE' : 'NEGATIVE'}
                    </strong>
                  </div>

                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Macular Edema Risk</span>
                    <strong className="text-amber-300 font-mono text-xs">{selectedPatient.biomarkers.dmeRisk}</strong>
                  </div>
                </div>
              </div>

              {/* Referral Pathway */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-950 to-slate-950 border border-cyan-500/30 space-y-1">
                <span className="text-[10px] font-mono text-cyan-400 uppercase">Recommended Referral Protocol</span>
                <div className="font-bold text-slate-100 text-sm">{selectedPatient.referralUrgency}</div>
                <p className="text-[11px] text-slate-400">
                  Transmitted via encrypted 3.2 KB telemetry packet over rural PHC uplink to District Referral Specialist queue.
                </p>
              </div>

              {/* ABDM FHIR JSON Payload Viewer */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileJson className="h-4 w-4 text-emerald-400" />
                    <span className="font-bold text-slate-200">HL7 FHIR R4 JSON Telemetry Packet</span>
                  </div>
                  <button
                    onClick={() => handleCopyJson(selectedPatient)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center space-x-1 border border-slate-700"
                  >
                    {copiedJson ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900/90 rounded-lg text-[10px] font-mono text-slate-300 overflow-x-auto max-h-48 border border-slate-800">
                  {JSON.stringify({
                    resourceType: 'DiagnosticReport',
                    id: selectedPatient.fhirResourceId,
                    status: 'final',
                    code: '79101-2 (Diabetic Retinopathy)',
                    patient: selectedPatient.patientId,
                    eye: selectedPatient.examinedEye,
                    icdrGrade: selectedPatient.icdrGrade,
                    icdrLabel: selectedPatient.icdrLabel,
                    etdrsStatus: selectedPatient.etdrsStatus,
                    biomarkers: selectedPatient.biomarkers,
                    center: selectedPatient.centerName,
                    telemetryBytes: 3276
                  }, null, 2)}
                </pre>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                FHIR ID: {selectedPatient.fhirResourceId}
              </span>
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CLOUD SERVICES CONFIGURATION MODAL                                        */}
      {/* ========================================================================= */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Custom Cloud Services Connection</h3>
                  <p className="text-xs text-slate-400">Open enterprise configuration for company handover</p>
                </div>
              </div>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              {/* Cloud Provider Type */}
              <div>
                <label className="block font-mono text-slate-300 mb-1">
                  Cloud Backend Provider Architecture
                </label>
                <select
                  value={cloudConfig.provider}
                  onChange={(e) => setCloudConfig({ ...cloudConfig, provider: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="mock">Simulated High-Availability Cloud (Built-in Demo)</option>
                  <option value="rest">Enterprise REST / GraphQL Backend (FastAPI, Node.js, Spring Boot)</option>
                  <option value="fhir">HL7 FHIR R4 Server (Ayushman Bharat ABDM / HAPI FHIR)</option>
                  <option value="supabase">Supabase / PostgreSQL Cloud Service</option>
                  <option value="aws">AWS HealthLake / S3 Telemetry Bucket</option>
                </select>
              </div>

              {/* Endpoint URL */}
              <div>
                <label className="block font-mono text-slate-300 mb-1">
                  Primary Cloud API Endpoint URL
                </label>
                <input
                  type="url"
                  value={cloudConfig.endpointUrl}
                  onChange={(e) => setCloudConfig({ ...cloudConfig, endpointUrl: e.target.value })}
                  placeholder="https://api.yourhospital.org/v1/patients"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              {/* API Key / Bearer Token */}
              <div>
                <label className="block font-mono text-slate-300 mb-1">
                  Enterprise Bearer Token / API Authorization Key
                </label>
                <input
                  type="password"
                  value={cloudConfig.apiKey}
                  onChange={(e) => setCloudConfig({ ...cloudConfig, apiKey: e.target.value })}
                  placeholder="Bearer eyJhbGciOiJIUzI1NiIsInR5c..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* FHIR Gateway Server */}
              <div>
                <label className="block font-mono text-slate-300 mb-1">
                  National Health Stack FHIR Base URL (ABDM R4)
                </label>
                <input
                  type="url"
                  value={cloudConfig.fhirServerUrl}
                  onChange={(e) => setCloudConfig({ ...cloudConfig, fhirServerUrl: e.target.value })}
                  placeholder="https://fhir.abdm.gov.in/R4"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Active Center Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-slate-300 mb-1">Center ID</label>
                  <input
                    type="text"
                    value={cloudConfig.centerId}
                    onChange={(e) => setCloudConfig({ ...cloudConfig, centerId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-mono text-slate-300 mb-1">Center Name</label>
                  <input
                    type="text"
                    value={cloudConfig.centerName}
                    onChange={(e) => setCloudConfig({ ...cloudConfig, centerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs"
                  />
                </div>
              </div>

              {/* Test Connection Output */}
              {testResult && (
                <div className={`p-3 rounded-xl border text-xs ${
                  testResult.success ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                }`}>
                  <div className="font-bold flex items-center space-x-1.5">
                    {testResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    <span>{testResult.status} &bull; Latency: {testResult.latencyMs}ms</span>
                  </div>
                  <p className="mt-1 text-[11px] opacity-90">{testResult.message}</p>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  <Zap className={`h-3.5 w-3.5 text-amber-400 ${isTestingConnection ? 'animate-bounce' : ''}`} />
                  <span>{isTestingConnection ? 'Pinging Cloud...' : 'Test Connection'}</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsConfigModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30"
                  >
                    Save &amp; Apply Config
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
