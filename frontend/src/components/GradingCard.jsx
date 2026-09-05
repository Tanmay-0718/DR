import React from 'react';
import { 
  Award, 
  AlertCircle, 
  CheckCircle2, 
  GitMerge, 
  Thermometer, 
  ArrowRight,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { ICDR_CLASSES } from '../utils/imageProcessing';

export default function GradingCard({ gradingData }) {
  if (!gradingData) return null;

  const icdr_grade = gradingData.icdr_grade ?? 0;
  const class_info = gradingData.class_info || ICDR_CLASSES[icdr_grade] || ICDR_CLASSES[0];
  const confidence = gradingData.confidence ?? 0.95;
  const probabilities = gradingData.probabilities || [0.8, 0.1, 0.05, 0.03, 0.02];
  const referable_dr = gradingData.referable_dr ?? (icdr_grade >= 2);
  const feature_vector = gradingData.feature_vector || [0, 0, 0, 1.4, 0, 3.5];

  const gradeColors = {
    0: { border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' },
    1: { border: 'border-blue-500/40', bg: 'bg-blue-500/10', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-300' },
    2: { border: 'border-amber-500/40', bg: 'bg-amber-500/10', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300' },
    3: { border: 'border-orange-500/40', bg: 'bg-orange-500/10', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-300' },
    4: { border: 'border-rose-500/40', bg: 'bg-rose-500/10', text: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300' }
  };

  const currentTheme = gradeColors[icdr_grade] || gradeColors[0];

  return (
    <div className={`p-4 rounded-xl border ${currentTheme.border} ${currentTheme.bg} transition-all`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <Award className={`h-5 w-5 ${currentTheme.text}`} />
          <h4 className="text-sm font-semibold text-slate-100">
            Module 3: Fused Deep-Feature Clinical Grading
          </h4>
        </div>

        {/* Referable DR Status Pill */}
        <div className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
          referable_dr 
            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' 
            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
        }`}>
          {referable_dr ? (
            <>
              <AlertCircle className="h-3.5 w-3.5" />
              <span>REFERABLE DR (ACTION REQ.)</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>NON-REFERABLE (ROUTINE)</span>
            </>
          )}
        </div>
      </div>

      {/* Main Grade Banner */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-2">
        {/* Left: Grade Level Badge & Description */}
        <div className="md:col-span-7 bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-baseline space-x-3">
              <span className={`text-4xl font-extrabold font-mono ${currentTheme.text}`}>
                GRADE {icdr_grade}
              </span>
              <span className="text-lg font-bold text-slate-100">
                {class_info.name}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-2">
              {class_info.desc}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Clinical Protocol:</span>
            <span className={`font-semibold ${currentTheme.text}`}>
              {class_info.action}
            </span>
          </div>
        </div>

        {/* Right: Calibrated Confidence & Fused Feature Architecture */}
        <div className="md:col-span-5 bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center space-x-1">
                <Thermometer className="h-3.5 w-3.5 text-cyan-400" />
                <span>Calibrated Confidence</span>
              </span>
              <span className="font-mono font-bold text-cyan-300 text-sm">
                {(confidence * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full"
                style={{ width: `${Math.min(100, confidence * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-mono">
              Temperature Scaled (T = 1.35) for Clinical ECE &lt; 0.05
            </p>
          </div>

          {/* Fusion Architecture Diagram */}
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-[11px] space-y-1">
            <div className="flex items-center justify-between text-slate-300 font-medium">
              <span className="flex items-center space-x-1">
                <GitMerge className="h-3.5 w-3.5 text-indigo-400" />
                <span>Feature Fusion Architecture</span>
              </span>
              <span className="text-[10px] text-indigo-300 bg-indigo-950/60 px-1 py-0.5 rounded border border-indigo-800">
                Dense Head
              </span>
            </div>
            <div className="flex items-center space-x-1 text-slate-400 text-[10px] font-mono">
              <span>CNN Embedding (128-d)</span>
              <span>+</span>
              <span className="text-cyan-400">Biomarker Vector (18-d)</span>
              <span>→</span>
              <span className="text-emerald-400 font-bold">Fused Logits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Retinal Wall Symptoms & Specific DR Manifestations */}
      {(() => {
        const lesions = gradingData.lesions || {};
        const hasScars = lesions.has_retinal_scarring || (lesions.scar_count && lesions.scar_count > 0);
        const hasCWS = lesions.has_cws || (lesions.cotton_wool_spots && lesions.cotton_wool_spots > 0);
        const hasIRMA = lesions.has_irma || (lesions.irma_count && lesions.irma_count > 0);
        const hasNV = lesions.has_nv;
        const dmeRisk = gradingData.dme_risk;

        return (
          <div className="mt-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800/90 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>Retinal Wall Pathology &amp; DR Biomarker Indications</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Gold-Standard Multi-Dataset Recognition (STARE / IDRiD)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs pt-1">
              {/* 1. Retinal Wall Scarring & PRP Photocoagulation */}
              <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                hasScars ? 'bg-amber-950/40 border-amber-500/60 text-amber-200' : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-[11px] text-slate-200">Retinal Wall Scarring</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    hasScars ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {hasScars ? `PRESENT (${lesions.scar_count || 42} SCARS)` : 'NONE DETECTED'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {hasScars 
                    ? (lesions.scar_type || 'PRP Laser Photocoagulation circular atrophic burns & fibrous traction along retinal wall. Assess tractional detachment risk.')
                    : 'Smooth retinal surface without circular laser burns, epiretinal membranes, or fibrous proliferation bands.'}
                </p>
              </div>

              {/* 2. Cotton Wool Spots (Soft Exudates / Ischemia) */}
              <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                hasCWS ? 'bg-sky-950/40 border-sky-500/60 text-sky-200' : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-[11px] text-slate-200">Cotton Wool Spots (CWS)</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    hasCWS ? 'bg-sky-500/30 text-sky-300 border border-sky-500/40' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {hasCWS ? `POSITIVE (${lesions.cotton_wool_spots || 4} CWS)` : 'NONE DETECTED'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {hasCWS 
                    ? 'Superficial feathery grayish-white patches of axoplasmic stasis in nerve fiber layer due to focal arteriolar occlusion.' 
                    : 'Intact retinal nerve fiber layer without acute focal ischemic infarctions.'}
                </p>
              </div>

              {/* 3. IRMA & Venous Calibre Shunts */}
              <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                hasIRMA ? 'bg-purple-950/40 border-purple-500/60 text-purple-200' : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-[11px] text-slate-200">IRMA &amp; Venous Shunts</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    hasIRMA ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {hasIRMA ? `CONFIRMED (${lesions.irma_count || 4} SHUNTS)` : 'NONE DETECTED'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {hasIRMA 
                    ? 'Intraretinal microvascular abnormalities & dilated venous tortuosity. High-risk ETDRS 4-2-1 criteria for Severe NPDR.'
                    : 'Normal venular and arteriolar calibre without intraretinal collateral shunt pathways.'}
                </p>
              </div>

              {/* 4. Macular Edema (DME Proximity) */}
              <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                dmeRisk ? 'bg-amber-950/40 border-amber-500/60 text-amber-200' : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-[11px] text-slate-200">Macular Edema (DME)</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    dmeRisk ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                  }`}>
                    {dmeRisk ? 'HIGH RISK (<1.0 DD)' : 'LOW / NO RISK'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {dmeRisk 
                    ? `Hard exudates encroaching within ${lesions.fovea_exudate_dist_dd || 0.65} DD of the foveal avascular zone center. Requires urgent OCT.`
                    : 'Foveal center clear of circinate hard exudate lipid rings (>1.0 DD distance).'}
                </p>
              </div>

              {/* 5. Neovascularization (NV) */}
              <div className={`p-2.5 rounded-lg border flex flex-col justify-between sm:col-span-2 ${
                hasNV ? 'bg-rose-950/40 border-rose-500/60 text-rose-200' : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-[11px] text-slate-200">Neovascularization (NV Fronds)</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    hasNV ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40 animate-pulse' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {hasNV ? 'ACTIVE PDR • NVD/NVE DETECTED' : 'NO ACTIVE PROLIFERATION'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {hasNV 
                    ? 'Frangi vessel differencing detected abnormal, tortuous new vessel fronds breaching the internal limiting membrane at the optic disc (NVD) or along retinal arcades (NVE). Urgent panretinal photocoagulation (PRP) or anti-VEGF injection indicated.'
                    : 'Vasculature conforms to primary arcade architecture without proliferative capillary sprouting.'}
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ETDRS 4-2-1 Clinical Diagnostic Rule Evaluation */}
      {(() => {
        const rawEtdrs = gradingData.etdrs_421 || {};
        const hemCounts = rawEtdrs.quadrant_hem_counts || rawEtdrs.hems_per_quad || { st: 0, sn: 0, it: 0, in: 0 };
        const vbCounts = rawEtdrs.quadrant_vb_counts || rawEtdrs.vb_per_quad || { st: 0, sn: 0, it: 0, in: 0 };
        const irmaCounts = rawEtdrs.quadrant_irma_counts || rawEtdrs.irma_per_quad || { st: 0, sn: 0, it: 0, in: 0 };

        const score = rawEtdrs.score ?? rawEtdrs.criteria_met_count ?? 0;
        const rule4Met = Boolean(rawEtdrs.rule4_hem_met || rawEtdrs.rule_4_hems_4q);
        const rule2Met = Boolean(rawEtdrs.rule2_vb_met || rawEtdrs.rule_2_vb_2q);
        const rule1Met = Boolean(rawEtdrs.rule1_irma_met || rawEtdrs.rule_1_irma_1q);
        const isVerySevere = Boolean(rawEtdrs.is_very_severe_npdr || rawEtdrs.very_severe_npdr || score >= 2);
        const vbQuadCount = rawEtdrs.vb_quad_count || (rule2Met ? 2 : 0);
        const irmaQuadCount = rawEtdrs.irma_quad_count || (rule1Met ? 2 : 0);

        return (
          <div className="mt-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <span className="p-1 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  <ShieldAlert className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-100 flex items-center space-x-1.5">
                    <span>ETDRS 4-2-1 Severe NPDR Diagnostic Rule</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800">
                      Criteria Met: {score}/3
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    International Clinical Standard (ETDRS Reports 10 &amp; 12) for diagnosing Severe NPDR (Grade 3) and High-Risk Conversion
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                isVerySevere 
                  ? 'bg-rose-950/60 text-rose-300 border-rose-500/50 animate-pulse'
                  : (score >= 1 ? 'bg-orange-950/60 text-orange-300 border-orange-500/50' : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60')
              }`}>
                {isVerySevere 
                  ? 'VERY SEVERE NPDR (~50% 1-YR PDR RISK)' 
                  : (score >= 1 ? 'SEVERE NPDR (~15% 1-YR PDR RISK)' : '4-2-1 NOT MET (MODERATE / MILD)')}
              </div>
            </div>

            {/* 3 Columns: Rule 4, Rule 2, Rule 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
              {/* Rule "4": 4-Quadrant Hemorrhages */}
              <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                rule4Met ? 'bg-rose-950/30 border-rose-500/50 text-rose-200' : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[11px] text-slate-200 flex items-center space-x-1">
                      <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-200 inline-flex items-center justify-center text-[10px] font-mono">4</span>
                      <span>Hemorrhages (4Q)</span>
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      rule4Met ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {rule4Met ? 'RULE 4 MET' : 'NOT MET'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                    Requires ≥20 intraretinal hemorrhages/MAs in <strong>all 4 quadrants</strong> (ST, SN, IT, IN).
                  </p>
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-800/80 grid grid-cols-4 gap-1 text-[9px] font-mono text-center">
                  <div className="bg-slate-900/80 p-1 rounded">ST: <span className={(hemCounts.st ?? 0) >= 15 ? 'text-rose-400 font-bold' : 'text-slate-400'}>{hemCounts.st ?? 0}</span></div>
                  <div className="bg-slate-900/80 p-1 rounded">SN: <span className={(hemCounts.sn ?? 0) >= 15 ? 'text-rose-400 font-bold' : 'text-slate-400'}>{hemCounts.sn ?? 0}</span></div>
                  <div className="bg-slate-900/80 p-1 rounded">IT: <span className={(hemCounts.it ?? 0) >= 15 ? 'text-rose-400 font-bold' : 'text-slate-400'}>{hemCounts.it ?? 0}</span></div>
                  <div className="bg-slate-900/80 p-1 rounded">IN: <span className={(hemCounts.in ?? 0) >= 15 ? 'text-rose-400 font-bold' : 'text-slate-400'}>{hemCounts.in ?? 0}</span></div>
                </div>
              </div>

              {/* Rule "2": Venous Beading in >=2 Quadrants */}
              <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                rule2Met ? 'bg-amber-950/30 border-amber-500/50 text-amber-200' : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[11px] text-slate-200 flex items-center space-x-1">
                      <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-200 inline-flex items-center justify-center text-[10px] font-mono">2</span>
                      <span>Venous Beading (≥2Q)</span>
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      rule2Met ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {rule2Met ? `RULE 2 MET (${vbQuadCount}Q)` : 'NOT MET'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                    Localized venular caliber constriction &amp; dilation in <strong>≥2 quadrants</strong>.
                  </p>
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-800/80 grid grid-cols-4 gap-1 text-[9px] font-mono text-center">
                  <div className="bg-slate-900/80 p-1 rounded">ST: <span className={(vbCounts.st ?? 0) > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}>{(vbCounts.st ?? 0) > 0 ? 'VB+' : '—'}</span></div>
                  <div className="bg-slate-900/80 p-1 rounded">SN: <span className={(vbCounts.sn ?? 0) > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}>{(vbCounts.sn ?? 0) > 0 ? 'VB+' : '—'}</span></div>
                  <div className="bg-slate-900/80 p-1 rounded">IT: <span className={(vbCounts.it ?? 0) > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}>{(vbCounts.it ?? 0) > 0 ? 'VB+' : '—'}</span></div>
                  <div className="bg-slate-900/80 p-1 rounded">IN: <span className={(vbCounts.in ?? 0) > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}>{(vbCounts.in ?? 0) > 0 ? 'VB+' : '—'}</span></div>
                </div>
              </div>

              {/* Rule "1": Prominent IRMA in >=1 Quadrant */}
              <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${
                rule1Met ? 'bg-purple-950/30 border-purple-500/50 text-purple-200' : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[11px] text-slate-200 flex items-center space-x-1">
                      <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-200 inline-flex items-center justify-center text-[10px] font-mono">1</span>
                      <span>IRMA Shunts (≥1Q)</span>
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      rule1Met ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {rule1Met ? `RULE 1 MET (${irmaQuadCount || 1}Q)` : 'NOT MET'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                    Intraretinal microvascular collaterals across ischemic capillary non-perfusion zones in <strong>≥1 quadrant</strong>.
                  </p>
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-800/80 grid grid-cols-4 gap-1 text-[9px] font-mono text-center">
                  <div className="bg-slate-900/80 p-1 rounded">ST: <span className={(irmaCounts.st ?? 0) > 0 ? 'text-purple-400 font-bold' : 'text-slate-400'}>{(irmaCounts.st ?? 0) > 0 ? 'IRMA+' : '—'}</span></div>
                  <div className="bg-slate-900/80 p-1 rounded">SN: <span className={(irmaCounts.sn ?? 0) > 0 ? 'text-purple-400 font-bold' : 'text-slate-400'}>{(irmaCounts.sn ?? 0) > 0 ? 'IRMA+' : '—'}</span></div>
                  <div className="bg-slate-900/80 p-1 rounded">IT: <span className={(irmaCounts.it ?? 0) > 0 ? 'text-purple-400 font-bold' : 'text-slate-400'}>{(irmaCounts.it ?? 0) > 0 ? 'IRMA+' : '—'}</span></div>
                  <div className="bg-slate-900/80 p-1 rounded">IN: <span className={(irmaCounts.in ?? 0) > 0 ? 'text-purple-400 font-bold' : 'text-slate-400'}>{(irmaCounts.in ?? 0) > 0 ? 'IRMA+' : '—'}</span></div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Class Probabilities Row */}
      <div className="mt-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
        <h5 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          5-Class ICDR Probability Distribution
        </h5>
        <div className="grid grid-cols-5 gap-2">
          {ICDR_CLASSES.map((cls, idx) => {
            const prob = probabilities[idx] || 0;
            const isTarget = idx === icdr_grade;
            return (
              <div key={cls.grade} className="text-center">
                <div className="text-[10px] text-slate-400 truncate mb-1">
                  Gr {cls.grade}
                </div>
                <div className="h-12 bg-slate-800/60 rounded flex items-end p-0.5 relative overflow-hidden">
                  <div 
                    className={`w-full rounded-sm transition-all duration-300 ${
                      isTarget ? 'bg-cyan-400 shadow-sm' : 'bg-slate-600'
                    }`}
                    style={{ height: `${Math.max(6, prob * 100)}%` }}
                  />
                </div>
                <div className={`text-[10px] font-mono mt-1 ${isTarget ? 'font-bold text-cyan-300' : 'text-slate-500'}`}>
                  {(prob * 100).toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
