import React, { useState } from 'react';
import { 
  Layers, 
  Eye, 
  Target, 
  Disc, 
  Dot, 
  Flame, 
  ShieldAlert,
  Sliders
} from 'lucide-react';

export default function SegmentationViewer({ 
  imageUrl, 
  segmentationData, 
  gradcamActive, 
  setGradcamActive,
  grade
}) {
  const [showDisc, setShowDisc] = useState(true);
  const [showFovea, setShowFovea] = useState(true);
  const [showMAs, setShowMAs] = useState(true);
  const [showHems, setShowHems] = useState(true);
  const [showExudates, setShowExudates] = useState(true);
  const [showNV, setShowNV] = useState(true);
  const [overlayOpacity, setOverlayOpacity] = useState(0.85);

  if (!segmentationData) return null;

  const { anatomy, lesions, dme_risk } = segmentationData;

  // Render SVG markers based on normalized coordinates (0..1)
  const discX = anatomy.disc.x * 100;
  const discY = anatomy.disc.y * 100;
  const discR = anatomy.disc.radius * 100;

  const foveaX = anatomy.fovea.x * 100;
  const foveaY = anatomy.fovea.y * 100;
  const foveaR = anatomy.fovea.radius * 100;

  // Simulated lesions coordinates based on counts
  const maCoords = [];
  for (let i = 0; i < Math.min(lesions.ma_count, 35); i++) {
    // clustered around mid-periphery and macular area
    const angle = (i * 137.5) * (Math.PI / 180);
    const dist = 14 + (i % 5) * 6;
    maCoords.push({
      x: foveaX + Math.cos(angle) * dist,
      y: foveaY + Math.sin(angle) * dist,
    });
  }

  const hemCoords = [];
  for (let i = 0; i < Math.min(lesions.hem_count, 25); i++) {
    const angle = (i * 95) * (Math.PI / 180);
    const dist = 18 + (i % 4) * 8;
    hemCoords.push({
      x: foveaX + Math.cos(angle) * dist,
      y: foveaY + Math.sin(angle) * dist,
      rx: 2.2 + (i % 3) * 0.8,
      ry: 1.6 + (i % 2) * 0.6,
      rot: (i * 35) % 180
    });
  }

  const exudateCoords = [];
  if (lesions.exudate_area_pct > 0) {
    const count = Math.min(Math.ceil(lesions.exudate_area_pct * 3.5), 20);
    for (let i = 0; i < count; i++) {
      // If DME risk, place closer to fovea (within 1DD)
      const dist = dme_risk ? (5 + (i % 3) * 3) : (16 + (i % 4) * 5);
      const angle = (i * 55 + 25) * (Math.PI / 180);
      exudateCoords.push({
        x: foveaX + Math.cos(angle) * dist,
        y: foveaY + Math.sin(angle) * dist,
        size: 2.5 + (i % 3) * 1.2
      });
    }
  }

  return (
    <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <Layers className="h-5 w-5 text-cyan-400" />
          <h4 className="text-sm font-semibold text-slate-100">
            Module 2: Anatomy & Lesion Multi-Head Segmentation
          </h4>
        </div>

        {/* Opacity slider */}
        <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
          <Sliders className="h-3.5 w-3.5 text-cyan-400" />
          <span>Opacity:</span>
          <input 
            type="range" 
            min="0.2" 
            max="1.0" 
            step="0.05"
            value={overlayOpacity}
            onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
            className="w-16 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="font-mono text-cyan-300 w-8">{Math.round(overlayOpacity * 100)}%</span>
        </div>
      </div>

      {/* Main Container: Image with SVG overlay + Control Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Retinal Canvas */}
        <div className="lg:col-span-8 flex justify-center items-center bg-black rounded-xl overflow-hidden border border-slate-800 relative aspect-square max-h-[460px]">
          {/* Base Fundus Image */}
          <img 
            src={imageUrl} 
            alt="Fundus Retina" 
            className="w-full h-full object-contain pointer-events-none select-none"
          />

          {/* Grad-CAM Heatmap Simulation Overlay */}
          {gradcamActive && (
            <div 
              className="absolute inset-0 pointer-events-none mix-blend-screen transition-opacity duration-300"
              style={{
                opacity: overlayOpacity,
                background: `radial-gradient(circle at ${foveaX}% ${foveaY}%, rgba(239, 68, 68, 0.75) 0%, rgba(245, 158, 11, 0.5) 25%, rgba(14, 165, 233, 0.25) 50%, transparent 75%)`
              }}
            />
          )}

          {/* High-DPI Vector Segmentation Masks */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-200"
            viewBox="0 0 100 100"
            style={{ opacity: overlayOpacity }}
          >
            {/* 1. Optic Disc */}
            {showDisc && (
              <g id="optic-disc-mask">
                <circle 
                  cx={discX} 
                  cy={discY} 
                  r={discR} 
                  fill="rgba(6, 182, 212, 0.2)" 
                  stroke="#06b6d4" 
                  strokeWidth="0.8" 
                  strokeDasharray="1.5 1"
                />
                <text 
                  x={discX} 
                  y={discY - discR - 1.5} 
                  fill="#06b6d4" 
                  fontSize="2.4" 
                  fontWeight="bold" 
                  textAnchor="middle"
                >
                  OPTIC DISC (1.0 DD)
                </text>
              </g>
            )}

            {/* 2. Fovea & Macula */}
            {showFovea && (
              <g id="fovea-mask">
                <circle 
                  cx={foveaX} 
                  cy={foveaY} 
                  r={foveaR} 
                  fill="none" 
                  stroke="#38bdf8" 
                  strokeWidth="0.6" 
                />
                {/* 1.0 Disc Diameter boundary ring around fovea (DME Risk Zone) */}
                <circle 
                  cx={foveaX} 
                  cy={foveaY} 
                  r={discR * 2} 
                  fill="none" 
                  stroke={dme_risk ? "rgba(239, 68, 68, 0.6)" : "rgba(56, 189, 248, 0.25)"} 
                  strokeWidth="0.5" 
                  strokeDasharray="1.2 1.2"
                />
                {/* Crosshairs */}
                <line x1={foveaX - 2.5} y1={foveaY} x2={foveaX + 2.5} y2={foveaY} stroke="#38bdf8" strokeWidth="0.5" />
                <line x1={foveaX} y1={foveaY - 2.5} x2={foveaX} y2={foveaY + 2.5} stroke="#38bdf8" strokeWidth="0.5" />
                <text 
                  x={foveaX} 
                  y={foveaY + foveaR + 3} 
                  fill="#38bdf8" 
                  fontSize="2.2" 
                  fontWeight="bold" 
                  textAnchor="middle"
                >
                  FOVEA (MACULA)
                </text>
              </g>
            )}

            {/* 3. Microaneurysms (MAs) */}
            {showMAs && maCoords.map((pt, idx) => (
              <circle 
                key={`ma-${idx}`}
                cx={pt.x} 
                cy={pt.y} 
                r="0.75" 
                fill="#eab308" 
                stroke="#ca8a04" 
                strokeWidth="0.25" 
              />
            ))}

            {/* 4. Hemorrhages (Hems) */}
            {showHems && hemCoords.map((pt, idx) => (
              <ellipse 
                key={`hem-${idx}`}
                cx={pt.x} 
                cy={pt.y} 
                rx={pt.rx} 
                ry={pt.ry} 
                transform={`rotate(${pt.rot} ${pt.x} ${pt.y})`}
                fill="rgba(220, 38, 38, 0.75)" 
                stroke="#b91c1c" 
                strokeWidth="0.3" 
              />
            ))}

            {/* 5. Hard Exudates */}
            {showExudates && exudateCoords.map((pt, idx) => (
              <polygon 
                key={`ex-${idx}`}
                points={`
                  ${pt.x},${pt.y - pt.size * 0.6} 
                  ${pt.x + pt.size * 0.7},${pt.y} 
                  ${pt.x},${pt.y + pt.size * 0.6} 
                  ${pt.x - pt.size * 0.7},${pt.y}
                `}
                fill="rgba(250, 204, 21, 0.9)" 
                stroke="#eab308" 
                strokeWidth="0.2" 
              />
            ))}

            {/* 6. Neovascularization (NV) differencing mask near disc */}
            {showNV && lesions.has_nv && (
              <g id="nv-mask">
                <path 
                  d={`M ${discX - 3} ${discY - 4} Q ${discX - 7} ${discY - 2} ${discX - 6} ${discY + 3} T ${discX - 2} ${discY + 6}`}
                  fill="none" 
                  stroke="#ec4899" 
                  strokeWidth="1.2" 
                  strokeLinecap="round"
                />
                <path 
                  d={`M ${discX - 5} ${discY - 1} Q ${discX - 9} ${discY + 1} ${discX - 4} ${discY + 4}`}
                  fill="none" 
                  stroke="#f43f5e" 
                  strokeWidth="0.9" 
                  strokeLinecap="round"
                />
                <text 
                  x={discX - 8} 
                  y={discY} 
                  fill="#f43f5e" 
                  fontSize="2.2" 
                  fontWeight="bold" 
                  textAnchor="end"
                >
                  NEOVASCULARIZATION (NVD)
                </text>
              </g>
            )}
          </svg>

          {/* Quick HUD legend badge */}
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-slate-950/80 backdrop-blur-sm border border-slate-800 text-[10px] font-mono text-slate-300">
            Field: 45° Posterior Pole • Optic Disc 1.0 DD Norm
          </div>
        </div>

        {/* Sidebar: Layer Toggles & Quantitative Feature Summary */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-3">
          {/* Layer toggles */}
          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Segmentation Layer Filters
            </h5>

            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button 
                onClick={() => setShowDisc(!showDisc)}
                className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border transition-all ${
                  showDisc ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300' : 'bg-slate-800/40 border-slate-700 text-slate-500'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <span>Optic Disc</span>
              </button>

              <button 
                onClick={() => setShowFovea(!showFovea)}
                className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border transition-all ${
                  showFovea ? 'bg-sky-950/40 border-sky-500/50 text-sky-300' : 'bg-slate-800/40 border-slate-700 text-slate-500'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                <span>Fovea Center</span>
              </button>

              <button 
                onClick={() => setShowMAs(!showMAs)}
                className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border transition-all ${
                  showMAs ? 'bg-amber-950/40 border-amber-500/50 text-amber-300' : 'bg-slate-800/40 border-slate-700 text-slate-500'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                <span>Microaneurysms</span>
              </button>

              <button 
                onClick={() => setShowHems(!showHems)}
                className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border transition-all ${
                  showHems ? 'bg-rose-950/40 border-rose-500/50 text-rose-300' : 'bg-slate-800/40 border-slate-700 text-slate-500'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                <span>Hemorrhages</span>
              </button>

              <button 
                onClick={() => setShowExudates(!showExudates)}
                className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border transition-all ${
                  showExudates ? 'bg-amber-950/40 border-amber-500/50 text-amber-300' : 'bg-slate-800/40 border-slate-700 text-slate-500'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-300"></span>
                <span>Hard Exudates</span>
              </button>

              <button 
                onClick={() => setShowNV(!showNV)}
                className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border transition-all ${
                  showNV && lesions.has_nv ? 'bg-pink-950/40 border-pink-500/50 text-pink-300' : 'bg-slate-800/40 border-slate-700 text-slate-500'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                <span>Neovasc (NV)</span>
              </button>
            </div>

            {/* Grad-CAM Heatmap Button */}
            <button 
              onClick={() => setGradcamActive(!gradcamActive)}
              className={`w-full mt-2 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                gradcamActive 
                  ? 'bg-gradient-to-r from-cyan-600/30 to-indigo-600/30 border-cyan-500/50 text-cyan-200 shadow-md' 
                  : 'bg-slate-800 hover:bg-slate-700/60 border-slate-700 text-slate-300'
              }`}
            >
              <Flame className={`h-4 w-4 ${gradcamActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{gradcamActive ? 'Grad-CAM Attribution Active' : 'Toggle Grad-CAM Heatmap (XAI)'}</span>
            </button>
          </div>

          {/* Quantitative Hand-Crafted Feature Vector */}
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-1.5 font-semibold">
              <span>Hand-Crafted Features (1×6)</span>
              <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800">
                Shared Contract
              </span>
            </div>

            <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Microaneurysms:</span>
                <span className="font-mono font-bold text-slate-200">{lesions.ma_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hemorrhages:</span>
                <span className="font-mono font-bold text-slate-200">{lesions.hem_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Exudate Area:</span>
                <span className="font-mono font-bold text-slate-200">{lesions.exudate_area_pct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Neovascularization:</span>
                <span className={`font-mono font-bold ${lesions.has_nv ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {lesions.has_nv ? 'PRESENT' : 'NONE'}
                </span>
              </div>
              <div className="flex justify-between col-span-2 pt-1 border-t border-slate-800/80">
                <span className="text-slate-400">Fovea-Exudate Dist:</span>
                <span className="font-mono font-bold text-slate-200">{lesions.fovea_exudate_dist_dd} DD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
