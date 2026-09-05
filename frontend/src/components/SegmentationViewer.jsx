import React, { useState } from 'react';
import { 
  Layers, 
  Eye, 
  Target, 
  Disc, 
  Dot, 
  Flame, 
  ShieldAlert,
  Sliders,
  RotateCw,
  RotateCcw,
  Compass
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
  const [showAxis, setShowAxis] = useState(true);
  const [showMAs, setShowMAs] = useState(true);
  const [showHems, setShowHems] = useState(true);
  const [showExudates, setShowExudates] = useState(true);
  const [showNV, setShowNV] = useState(true);
  const [showScars, setShowScars] = useState(true);
  const [showCWS, setShowCWS] = useState(true);
  const [showIRMA, setShowIRMA] = useState(true);
  const [showVB, setShowVB] = useState(true);
  const [showQuadrants, setShowQuadrants] = useState(true);
  const [overlayOpacity, setOverlayOpacity] = useState(0.85);
  const [simTiltAngle, setSimTiltAngle] = useState(0);

  if (!segmentationData) return null;

  const anatomy = segmentationData.anatomy || {
    disc: { x: 0.78, y: 0.50, radius: 0.09 },
    fovea: { x: 0.44, y: 0.52, radius: 0.04 }
  };
  const lesions = segmentationData.lesions || {
    ma_count: 0,
    hem_count: 0,
    exudate_area_pct: 0.0,
    has_nv: false,
    fovea_exudate_dist_dd: 3.5,
    disc_to_lesion_dist_dd: 1.42
  };
  const dme_risk = segmentationData.dme_risk || false;

  // Render SVG markers based on normalized coordinates (0..1)
  const discX = anatomy.disc.x * 100;
  const discY = anatomy.disc.y * 100;
  const discR = anatomy.disc.radius * 100;

  const foveaX = anatomy.fovea.x * 100;
  const foveaY = anatomy.fovea.y * 100;
  const foveaR = anatomy.fovea.radius * 100;

  // Rotation-invariant Papillomacular Axis calculation
  const nominalAngle = anatomy.tilt_angle_deg !== undefined ? anatomy.tilt_angle_deg : 178.5;
  const liveTrackedAngle = Number(((nominalAngle - simTiltAngle + 360) % 360).toFixed(1));
  const axisMidX = (discX + foveaX) / 2;
  const axisMidY = (discY + foveaY) / 2;

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

  // 6. Cotton Wool Spots (Soft Exudates / Ischemic Infarcts)
  const cwsCoords = [];
  const cwsCount = lesions.cotton_wool_spots || (lesions.has_cws ? 4 : 0);
  for (let i = 0; i < Math.min(cwsCount, 12); i++) {
    const angle = (i * 115 + 40) * (Math.PI / 180);
    const dist = 22 + (i % 3) * 6;
    cwsCoords.push({
      x: foveaX + Math.cos(angle) * dist,
      y: foveaY + Math.sin(angle) * dist,
      rx: 3.2 + (i % 2) * 0.9,
      ry: 2.0 + (i % 3) * 0.5,
      rot: (i * 45) % 180
    });
  }

  // 7. Retinal Wall Scarring (PRP Laser Photocoagulation Scars & Fibrotic Wall Traction)
  const scarCoords = [];
  const hasScars = lesions.has_retinal_scarring || (lesions.scar_count && lesions.scar_count > 0);
  if (hasScars) {
    const count = Math.min(Math.max(lesions.scar_count || 38, 20), 45);
    for (let i = 0; i < count; i++) {
      // Regular concentric grid arcs characteristic of Panretinal Photocoagulation
      const ring = 1 + (i % 3);
      const angle = ((i * 19) % 360) * (Math.PI / 180);
      const dist = 36 + ring * 6.5;
      scarCoords.push({
        x: Math.max(8, Math.min(92, 50 + Math.cos(angle) * dist)),
        y: Math.max(8, Math.min(92, 50 + Math.sin(angle) * dist)),
        r: 1.35 + (i % 2) * 0.35
      });
    }
  }

  // 8. Intraretinal Microvascular Abnormalities (IRMA) & Shunt Vessels
  const irmaCoords = [];
  const irmaCount = lesions.irma_count || (lesions.has_irma ? 4 : 0);
  for (let i = 0; i < Math.min(irmaCount, 8); i++) {
    const angle = (i * 85 + 30) * (Math.PI / 180);
    const dist = 24 + (i % 2) * 7;
    const startX = foveaX + Math.cos(angle) * dist;
    const startY = foveaY + Math.sin(angle) * dist;
    irmaCoords.push({
      startX,
      startY,
      d: `M ${startX} ${startY} Q ${startX + 3.5} ${startY - 3} ${startX + 5.5} ${startY + 2.5} T ${startX + 8} ${startY - 1}`
    });
  }

  // 9. Venous Beading (VB) Coords along Major Retinal Venules (ETDRS Rule "2")
  const vbCoords = [];
  const hasVB = lesions.has_vb || (lesions.vb_quad_count && lesions.vb_quad_count > 0);
  if (hasVB) {
    const arcades = [
      { startX: discX - 6, startY: discY - 10, cpX: foveaX + 4, cpY: discY - 18, endX: foveaX - 12, endY: discY - 14, quad: 'ST' },
      { startX: discX - 6, startY: discY + 10, cpX: foveaX + 4, cpY: discY + 18, endX: foveaX - 12, endY: discY + 14, quad: 'IT' }
    ];
    arcades.forEach((arc, aIdx) => {
      for (let b = 0; b < 5; b++) {
        const t = 0.25 + (b * 0.14);
        const bx = (1 - t) * (1 - t) * arc.startX + 2 * (1 - t) * t * arc.cpX + t * t * arc.endX;
        const by = (1 - t) * (1 - t) * arc.startY + 2 * (1 - t) * t * arc.cpY + t * t * arc.endY;
        vbCoords.push({ x: bx, y: by, r: 1.4 + (b % 2) * 0.9, id: `vb-${aIdx}-${b}`, quad: arc.quad });
      }
    });
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
        {/* Retinal Canvas Column */}
        <div className="lg:col-span-8 flex flex-col space-y-2">
          <div className="w-full flex justify-center items-center bg-black rounded-xl overflow-hidden border border-slate-800 relative aspect-square max-h-[460px]">
            {/* Base Fundus Image with Dynamic Tilt */}
            <img 
              src={imageUrl} 
              alt="Fundus Retina" 
              className="w-full h-full object-contain pointer-events-none select-none transition-transform duration-100 ease-out"
              style={{ transform: `rotate(${simTiltAngle}deg)` }}
            />

            {/* Grad-CAM Heatmap Simulation Overlay */}
            {gradcamActive && (
              <div 
                className="absolute inset-0 pointer-events-none mix-blend-screen transition-all duration-100 ease-out"
                style={{
                  opacity: overlayOpacity,
                  transform: `rotate(${simTiltAngle}deg)`,
                  background: `radial-gradient(circle at ${foveaX}% ${foveaY}%, rgba(239, 68, 68, 0.75) 0%, rgba(245, 158, 11, 0.5) 25%, rgba(14, 165, 233, 0.25) 50%, transparent 75%)`
                }}
              />
            )}

            {/* High-DPI Vector Segmentation Masks */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-100 ease-out"
              viewBox="0 0 100 100"
              style={{ 
                opacity: overlayOpacity,
                transform: `rotate(${simTiltAngle}deg)`,
                transformOrigin: '50% 50%'
              }}
            >
              {/* Dynamic Papillomacular Axis (Vascular Arcade Bisector) */}
              {showAxis && (
                <g id="papillomacular-axis">
                  <line 
                    x1={discX} 
                    y1={discY} 
                    x2={foveaX} 
                    y2={foveaY} 
                    stroke="#38bdf8" 
                    strokeWidth="0.8" 
                    strokeDasharray="2 1.5" 
                    strokeOpacity="0.85"
                  />
                  {/* Axis midpoint label pill */}
                  <rect 
                    x={axisMidX - 16} 
                    y={axisMidY - 3} 
                    width="32" 
                    height="6" 
                    rx="1.5" 
                    fill="rgba(15, 23, 42, 0.85)" 
                    stroke="#0284c7" 
                    strokeWidth="0.4"
                  />
                  <text 
                    x={axisMidX} 
                    y={axisMidY + 1} 
                    fill="#38bdf8" 
                    fontSize="1.9" 
                    fontFamily="monospace"
                    fontWeight="bold" 
                    textAnchor="middle"
                  >
                    {liveTrackedAngle}° • {anatomy.od_fovea_dist_dd || 2.74} DD
                  </text>
                </g>
              )}

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

              {/* 7. Cotton Wool Spots (Soft Exudates - Ischemic Axoplasmic Stasis) */}
              {showCWS && cwsCoords.map((pt, idx) => (
                <g key={`cws-${idx}`}>
                  <ellipse 
                    cx={pt.x} 
                    cy={pt.y} 
                    rx={pt.rx} 
                    ry={pt.ry} 
                    transform={`rotate(${pt.rot} ${pt.x} ${pt.y})`}
                    fill="rgba(224, 242, 254, 0.75)" 
                    stroke="#7dd3fc" 
                    strokeWidth="0.4" 
                    strokeDasharray="0.8 0.5"
                  />
                  {idx === 0 && (
                    <text 
                      x={pt.x} 
                      y={pt.y - pt.ry - 1} 
                      fill="#38bdf8" 
                      fontSize="1.9" 
                      fontWeight="bold" 
                      textAnchor="middle"
                    >
                      COTTON WOOL SPOT (ISCHEMIA)
                    </text>
                  )}
                </g>
              ))}

              {/* 8. Retinal Wall Scarring (PRP Laser Photocoagulation Scars & Fibrous Traction) */}
              {showScars && scarCoords.map((pt, idx) => (
                <g key={`scar-${idx}`}>
                  {/* Outer pigmented / atrophic border */}
                  <circle 
                    cx={pt.x} 
                    cy={pt.y} 
                    r={pt.r} 
                    fill="rgba(245, 158, 11, 0.45)" 
                    stroke="#d97706" 
                    strokeWidth="0.3" 
                  />
                  {/* Inner dark pigmented core */}
                  <circle 
                    cx={pt.x} 
                    cy={pt.y} 
                    r={pt.r * 0.4} 
                    fill="#78350f" 
                  />
                  {idx === 0 && (
                    <text 
                      x={pt.x} 
                      y={pt.y - pt.r - 1.5} 
                      fill="#f59e0b" 
                      fontSize="1.9" 
                      fontWeight="bold" 
                      textAnchor="middle"
                    >
                      PRP PHOTOCOAGULATION SCARS
                    </text>
                  )}
                </g>
              ))}

              {/* 9. Intraretinal Microvascular Abnormalities (IRMA) */}
              {showIRMA && irmaCoords.map((pt, idx) => (
                <g key={`irma-${idx}`}>
                  <path 
                    d={pt.d} 
                    fill="none" 
                    stroke="#c084fc" 
                    strokeWidth="0.9" 
                    strokeLinecap="round" 
                  />
                  {idx === 0 && (
                    <text 
                      x={pt.startX + 4} 
                      y={pt.startY - 2} 
                      fill="#c084fc" 
                      fontSize="1.9" 
                      fontWeight="bold" 
                      textAnchor="middle"
                    >
                      IRMA (ETDRS 4-2-1)
                    </text>
                  )}
                </g>
              ))}

              {/* 9. Venous Beading (VB - ETDRS Rule "2") */}
              {showVB && vbCoords.map((vb) => (
                <g key={vb.id} className="cursor-pointer hover:opacity-100 transition-opacity">
                  <circle
                    cx={vb.x}
                    cy={vb.y}
                    r={vb.r}
                    fill="#f97316"
                    fillOpacity="0.8"
                    stroke="#ffedd5"
                    strokeWidth="0.35"
                  />
                  <circle
                    cx={vb.x}
                    cy={vb.y}
                    r={vb.r * 1.5}
                    fill="none"
                    stroke="#ea580c"
                    strokeWidth="0.25"
                    strokeDasharray="0.8, 0.8"
                    className="animate-pulse"
                  />
                </g>
              ))}

              {/* 10. ETDRS 4-Quadrant Partitioning Grid (ST, SN, IT, IN) */}
              {showQuadrants && (
                <g className="quadrant-grid" opacity="0.40">
                  {/* Horizontal dividing axis through fovea */}
                  <line 
                    x1="6" 
                    y1={foveaY} 
                    x2="94" 
                    y2={foveaY} 
                    stroke="#38bdf8" 
                    strokeWidth="0.35" 
                    strokeDasharray="2, 2" 
                  />
                  {/* Vertical dividing axis through fovea */}
                  <line 
                    x1={foveaX} 
                    y1="6" 
                    x2={foveaX} 
                    y2="94" 
                    stroke="#38bdf8" 
                    strokeWidth="0.35" 
                    strokeDasharray="2, 2" 
                  />
                  {/* Quadrant Labels */}
                  {(() => {
                    const isOD = (discX < foveaX);
                    const stLabel = isOD ? { x: foveaX + 22, y: foveaY - 18, name: 'ST' } : { x: foveaX - 22, y: foveaY - 18, name: 'ST' };
                    const snLabel = isOD ? { x: foveaX - 22, y: foveaY - 18, name: 'SN' } : { x: foveaX + 22, y: foveaY - 18, name: 'SN' };
                    const itLabel = isOD ? { x: foveaX + 22, y: foveaY + 18, name: 'IT' } : { x: foveaX - 22, y: foveaY + 18, name: 'IT' };
                    const inLabel = isOD ? { x: foveaX - 22, y: foveaY + 18, name: 'IN' } : { x: foveaX + 22, y: foveaY + 18, name: 'IN' };

                    return (
                      <>
                        <text x={stLabel.x} y={stLabel.y} fill="#7dd3fc" fontSize="2.5" fontWeight="bold" textAnchor="middle">ST (4-2-1)</text>
                        <text x={snLabel.x} y={snLabel.y} fill="#7dd3fc" fontSize="2.5" fontWeight="bold" textAnchor="middle">SN (4-2-1)</text>
                        <text x={itLabel.x} y={itLabel.y} fill="#7dd3fc" fontSize="2.5" fontWeight="bold" textAnchor="middle">IT (4-2-1)</text>
                        <text x={inLabel.x} y={inLabel.y} fill="#7dd3fc" fontSize="2.5" fontWeight="bold" textAnchor="middle">IN (4-2-1)</text>
                      </>
                    );
                  })()}
                </g>
              )}
            </svg>

            {/* Quick HUD legend badge */}
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-slate-950/80 backdrop-blur-sm border border-slate-800 text-[10px] font-mono text-slate-300">
              Field: 45° Posterior Pole &bull; Optic Disc 1.0 DD Norm
            </div>
          </div>

          {/* Camera Tilt Simulator & Invariant Angle HUD bar */}
          <div className="w-full bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <Compass className="h-4 w-4 text-cyan-400" />
              <span className="font-semibold text-slate-200">Angle-Invariant Tracking:</span>
              <span className="font-mono text-[11px] text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800">
                Axis: {liveTrackedAngle}° &bull; {anatomy.od_fovea_dist_dd || 2.74} DD ({anatomy.eye_side || 'OS'})
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400 text-[11px]">Tilt:</span>
              <button 
                onClick={() => setSimTiltAngle(prev => Math.max(prev - 5, -45))}
                title="Rotate counter-clockwise 5°"
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
              <input 
                type="range" 
                min="-45" 
                max="45" 
                step="1"
                value={simTiltAngle}
                onChange={(e) => setSimTiltAngle(parseInt(e.target.value, 10))}
                className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <button 
                onClick={() => setSimTiltAngle(prev => Math.min(prev + 5, 45))}
                title="Rotate clockwise 5°"
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              >
                <RotateCw className="h-3 w-3" />
              </button>
              <span className="font-mono text-cyan-300 text-xs w-10 text-right">
                {simTiltAngle > 0 ? `+${simTiltAngle}°` : `${simTiltAngle}°`}
              </span>
              {simTiltAngle !== 0 && (
                <button 
                  onClick={() => setSimTiltAngle(0)}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 font-mono transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
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
                onClick={() => setShowAxis(!showAxis)}
                className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border transition-all col-span-2 ${
                  showAxis ? 'bg-sky-950/40 border-sky-500/50 text-sky-300' : 'bg-slate-800/40 border-slate-700 text-slate-500'
                }`}
              >
                <Compass className="h-3.5 w-3.5 text-cyan-400" />
                <span>Papillomacular Axis ({liveTrackedAngle}°)</span>
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

              <button 
                onClick={() => setShowCWS(!showCWS)}
                className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border transition-all ${
                  showCWS && (lesions.has_cws || lesions.cotton_wool_spots > 0) ? 'bg-sky-950/40 border-sky-500/50 text-sky-300' : 'bg-slate-800/40 border-slate-700 text-slate-500'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-sky-300"></span>
                <span>Cotton Wool (CWS)</span>
              </button>

              <button 
                onClick={() => setShowScars(!showScars)}
                className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border transition-all ${
                  showScars && (lesions.has_retinal_scarring || lesions.scar_count > 0) ? 'bg-amber-950/40 border-amber-500/50 text-amber-300' : 'bg-slate-800/40 border-slate-700 text-slate-500'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>PRP Wall Scars</span>
              </button>

              <button 
                onClick={() => setShowVB(!showVB)}
                className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border transition-all ${
                  showVB && (lesions.has_vb || lesions.vb_quad_count > 0) ? 'bg-orange-950/40 border-orange-500/50 text-orange-300' : 'bg-slate-800/40 border-slate-700 text-slate-500'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <span>Venous Beading (VB)</span>
              </button>

              <button 
                onClick={() => setShowQuadrants(!showQuadrants)}
                className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border transition-all ${
                  showQuadrants ? 'bg-sky-950/40 border-sky-500/50 text-sky-300' : 'bg-slate-800/40 border-slate-700 text-slate-500'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                <span>4-Quadrant Grid (4-2-1)</span>
              </button>

              <button 
                onClick={() => setShowIRMA(!showIRMA)}
                className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border transition-all col-span-2 ${
                  showIRMA && (lesions.has_irma || lesions.irma_count > 0) ? 'bg-purple-950/40 border-purple-500/50 text-purple-300' : 'bg-slate-800/40 border-slate-700 text-slate-500'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                <span>IRMA &amp; Vascular Shunts (Rule "1")</span>
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

          {/* Anatomical Calibration (Zeiss Visucam 500 / UNA-Paraguay) */}
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-1.5 font-semibold">
              <div className="flex items-center space-x-1.5">
                <Compass className="h-3.5 w-3.5 text-cyan-400" />
                <span>Rotation-Invariant Anatomy</span>
              </div>
              <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                Arcade Tracked
              </span>
            </div>

            <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Eye Side:</span>
                <span className="font-mono font-bold text-cyan-300">{anatomy.eye_side || 'OS'} ({anatomy.eye_side === 'OD' ? 'Right' : 'Left'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">OD-Fovea Dist:</span>
                <span className="font-mono font-bold text-slate-200">{anatomy.od_fovea_dist_dd || 2.74} DD</span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-slate-400">Axis Orientation:</span>
                <span className="font-mono font-bold text-amber-300">{liveTrackedAngle}° ({simTiltAngle !== 0 ? `Sim: ${simTiltAngle > 0 ? '+' : ''}${simTiltAngle}°` : '0° Tilt'})</span>
              </div>
              <div className="flex justify-between col-span-2 pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
                <span>Method: Vascular Arcade Bisector &bull; FAZ Search</span>
              </div>
            </div>
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
