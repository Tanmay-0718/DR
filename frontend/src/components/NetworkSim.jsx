import React, { useState, useMemo } from 'react';
import { 
  Network, 
  Sliders, 
  Users, 
  Wifi, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Zap,
  HardDrive,
  TrendingUp,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { runTelemedSimulation } from '../utils/simEngine';

export default function NetworkSim() {
  const [numPhcs, setNumPhcs] = useState(30);
  const [numSpecialists, setNumSpecialists] = useState(2);
  const [bandwidthKbps, setBandwidthKbps] = useState(250);

  // Compute simulation data
  const simData = useMemo(() => {
    return runTelemedSimulation({
      numPhcs,
      numSpecialists,
      bandwidthKbps
    });
  }, [numPhcs, numSpecialists, bandwidthKbps]);

  const { kpis, series } = simData;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <span>Module 5: Discrete-Event Telemedicine Network Simulator</span>
            <span className="text-xs font-mono font-normal bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded border border-indigo-800">
              SimEvents Replication
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Simulates queuing bottlenecks and rural link constraints over an 8-hour shift across district networks. 
            Demonstrates why transmitting 3.2 KB structured telemetry rather than 15 MB raw images is essential for rural health centers.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-indigo-950/40 px-3 py-1.5 rounded-lg border border-indigo-500/30 text-xs font-mono text-indigo-300">
          <Zap className="h-4 w-4 text-indigo-400" />
          <span>Bandwidth Efficiency: {kpis.bandwidthSavingsRatio}</span>
        </div>
      </div>

      {/* Control Sliders & Network Animation Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Slider 1: PHC Clinics */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-semibold flex items-center space-x-1.5">
              <Users className="h-4 w-4 text-cyan-400" />
              <span>Primary Health Centers (PHCs)</span>
            </span>
            <span className="font-mono font-bold text-cyan-300 text-sm">{numPhcs} Clinics</span>
          </div>
          <input 
            type="range" 
            min="10" 
            max="60" 
            step="5"
            value={numPhcs}
            onChange={(e) => setNumPhcs(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>10 (Sub-district)</span>
            <span>60 (Dense District)</span>
          </div>
        </div>

        {/* Slider 2: District Specialists */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-semibold flex items-center space-x-1.5">
              <Clock className="h-4 w-4 text-emerald-400" />
              <span>Active District Specialists</span>
            </span>
            <span className="font-mono font-bold text-emerald-300 text-sm">{numSpecialists} Ophthalmologists</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="5" 
            step="1"
            value={numSpecialists}
            onChange={(e) => setNumSpecialists(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>1 (Severe Bottleneck)</span>
            <span>5 (High Capacity)</span>
          </div>
        </div>

        {/* Slider 3: Rural Bandwidth */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-semibold flex items-center space-x-1.5">
              <Wifi className="h-4 w-4 text-indigo-400" />
              <span>Uplink Bandwidth</span>
            </span>
            <span className="font-mono font-bold text-indigo-300 text-sm">{bandwidthKbps} Kbps</span>
          </div>
          <input 
            type="range" 
            min="100" 
            max="1000" 
            step="50"
            value={bandwidthKbps}
            onChange={(e) => setBandwidthKbps(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>100 Kbps (2G/EDGE)</span>
            <span>1000 Kbps (4G LTE)</span>
          </div>
        </div>
      </div>

      {/* Visual Network Architecture Diagram */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>End-to-End Packet Flow Animation</span>
          <span className="text-[11px] font-mono text-cyan-400">
            Packet Size: {kpis.payloadSizeKb} KB • Retries: {kpis.packetRetryRatePct}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center relative">
          {/* Node 1: Edge PHC */}
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center space-y-1 relative">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto mb-1">
              <Cpu className="h-4 w-4" />
            </div>
            <div className="text-xs font-bold text-slate-200">{numPhcs} Rural PHCs</div>
            <div className="text-[10px] text-slate-400 font-mono">
              Inference: {kpis.edgeInferenceMs}ms
            </div>
          </div>

          {/* Node 2: 2G/4G Uplink */}
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center space-y-1">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto mb-1">
              <Wifi className="h-4 w-4" />
            </div>
            <div className="text-xs font-bold text-slate-200">{bandwidthKbps} Kbps Rural Link</div>
            <div className="text-[10px] text-indigo-300 font-mono">
              Tx Latency: {kpis.txLatencyMs}ms
            </div>
          </div>

          {/* Node 3: Priority Triage */}
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center space-y-1">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-1">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-xs font-bold text-slate-200">Triage Dispatch</div>
            <div className="text-[10px] text-amber-300 font-mono">
              35% Referable Triage
            </div>
          </div>

          {/* Node 4: Specialist Queue */}
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center space-y-1">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-1">
              <Users className="h-4 w-4" />
            </div>
            <div className="text-xs font-bold text-slate-200">{numSpecialists} Ophthalmologist(s)</div>
            <div className="text-[10px] text-emerald-300 font-mono">
              Wait Time: {kpis.scenarioB.maxWaitHours}h max
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Screened in 8-hr Shift</span>
          <span className="text-xl font-mono font-bold text-slate-100">{kpis.totalScreenedShift}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Across {numPhcs} PHCs</span>
        </div>

        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Referable Case Triage</span>
          <span className="text-xl font-mono font-bold text-amber-400">{kpis.referableCases}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Requiring Specialist Review</span>
        </div>

        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Total Edge Handoff</span>
          <span className="text-xl font-mono font-bold text-cyan-400">{kpis.totalHandoffMs} ms</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Inference + Uplink Tx</span>
        </div>

        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Staffing Recommendation</span>
          <span className={`text-xl font-mono font-bold ${numSpecialists >= kpis.minSpecialistsRecommended ? 'text-emerald-400' : 'text-rose-400'}`}>
            &ge; {kpis.minSpecialistsRecommended} Specialists
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">To prevent backlog</span>
        </div>
      </div>

      {/* Interactive Dual-Curve Comparison Chart */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
              <span>Dynamic Queue Dynamics Comparison</span>
              <span className="text-[11px] font-mono text-slate-400">8-Hour Shift Time Series</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              SimEvents Discrete-Event Model: Scenario A (1 Specialist Bottleneck) vs Scenario B ({numSpecialists} Specialists)
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-rose-500 inline-block"></span>
              <span className="text-rose-300">Scenario A (1 Specialist Bottleneck)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-cyan-400 inline-block"></span>
              <span className="text-cyan-300">Scenario B ({numSpecialists} Specialists)</span>
            </div>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="w-full h-64 relative bg-slate-950/60 rounded-lg p-3 border border-slate-800/80">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200">
            {/* Grid lines */}
            <line x1="40" y1="20" x2="490" y2="20" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="40" y1="60" x2="490" y2="60" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="40" y1="100" x2="490" y2="100" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="40" y1="140" x2="490" y2="140" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="40" y1="170" x2="490" y2="170" stroke="#475569" strokeWidth="1" />

            {/* Y-Axis Labels */}
            <text x="32" y="24" fill="#94a3b8" fontSize="9" textAnchor="end" fontFamily="monospace">30</text>
            <text x="32" y="64" fill="#94a3b8" fontSize="9" textAnchor="end" fontFamily="monospace">20</text>
            <text x="32" y="104" fill="#94a3b8" fontSize="9" textAnchor="end" fontFamily="monospace">10</text>
            <text x="32" y="144" fill="#94a3b8" fontSize="9" textAnchor="end" fontFamily="monospace">5</text>
            <text x="32" y="174" fill="#94a3b8" fontSize="9" textAnchor="end" fontFamily="monospace">0</text>

            {/* Curve A: 1 Specialist Bottleneck */}
            <polyline 
              fill="none" 
              stroke="#f43f5e" 
              strokeWidth="2.5" 
              points={series.scenarioAQueue.map((q, idx) => {
                const x = 40 + (idx / (series.scenarioAQueue.length - 1)) * 450;
                const y = 170 - (Math.min(q, 35) / 35) * 150;
                return `${x},${y}`;
              }).join(' ')}
            />

            {/* Curve B: Current Staffing */}
            <polyline 
              fill="none" 
              stroke="#06b6d4" 
              strokeWidth="2.5" 
              points={series.scenarioBQueue.map((q, idx) => {
                const x = 40 + (idx / (series.scenarioBQueue.length - 1)) * 450;
                const y = 170 - (Math.min(q, 35) / 35) * 150;
                return `${x},${y}`;
              }).join(' ')}
            />

            {/* X-Axis Time Labels */}
            <text x="40" y="188" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="monospace">0h</text>
            <text x="152" y="188" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="monospace">2h</text>
            <text x="265" y="188" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="monospace">4h</text>
            <text x="377" y="188" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="monospace">6h</text>
            <text x="490" y="188" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="monospace">8h</text>
          </svg>
        </div>

        {/* Bottleneck Warning / Analysis */}
        <div className="flex items-center justify-between text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center space-x-2">
            {kpis.scenarioA.isBottleneck ? (
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            )}
            <span className="text-slate-300">
              <strong className="text-rose-400">Scenario A Bottleneck:</strong> With only 1 specialist, backlog climbs to{' '}
              <span className="font-mono text-rose-300 font-bold">{kpis.scenarioA.maxQueue}</span> patients (wait time{' '}
              <span className="font-mono text-rose-300 font-bold">{kpis.scenarioA.maxWaitHours}h</span>).
            </span>
          </div>

          <div className="text-emerald-400 font-mono font-semibold hidden sm:block">
            Scenario B: &lt;{kpis.scenarioB.maxWaitHours}h wait
          </div>
        </div>
      </div>
    </div>
  );
}
