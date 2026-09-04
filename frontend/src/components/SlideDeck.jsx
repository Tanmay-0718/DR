import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Presentation, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  Network, 
  ShieldCheck,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function SlideDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const slides = [
    {
      num: 1,
      title: 'AI-Assisted Diabetic Retinopathy Screening for Rural Telemedicine Networks',
      subtitle: 'Smart India Hackathon 2026 • Grand Finale Submission',
      badge: 'Project Blueprint',
      content: (
        <div className="space-y-6 text-center max-w-3xl mx-auto py-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <span>SIH 2026 Problem Statement: Rural Health &amp; Tele-Ophthalmology</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Intelligent Edge Triage &amp; Telemedicine Bottleneck Optimization
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            A comprehensive, end-to-end medical software suite engineered in MATLAB, Simulink, and SimEvents. 
            Delivers autonomous image quality assessment, multi-head lesion segmentation, feature-fused ICDR classification, 
            and discrete-event queuing optimization for Primary Health Centers (PHCs) across India.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-left">
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block">Edge Compute</span>
              <span className="text-lg font-bold text-cyan-400 font-mono">&lt; 200 ms</span>
              <span className="text-[10px] text-slate-500 block">NVIDIA Orin Nano</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block">Rural Payload</span>
              <span className="text-lg font-bold text-indigo-400 font-mono">3.2 KB</span>
              <span className="text-[10px] text-slate-500 block">99.98% Bandwidth Cut</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block">Clinical Sensitivity</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">&gt; 92.6%</span>
              <span className="text-[10px] text-slate-500 block">Referable DR Standard</span>
            </div>
          </div>
        </div>
      )
    },
    {
      num: 2,
      title: 'The Clinical Crisis: India’s Diabetic Retinopathy Epidemic',
      subtitle: 'Epidemiology, Infrastructure Bottlenecks & The Need for Edge AI',
      badge: 'Clinical Need',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-4">
          <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-200">
              <strong className="text-rose-300 block text-base mb-1">77 Million Diabetics in India</strong>
              Over 20% develop Diabetic Retinopathy (DR), the leading cause of preventable blindness in working-age adults.
            </div>
            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
              <strong className="text-slate-100 block mb-1">The Rural Tele-Ophthalmology Paradox</strong>
              India has only ~20,000 ophthalmologists, with over 70% concentrated in tier-1 urban centers. Over 700 million rural citizens rely on under-resourced Primary Health Centers (PHCs).
            </div>
            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
              <strong className="text-slate-100 block mb-1">Why Current Solutions Fail</strong>
              Transmitting 15 MB raw fundus images over 2G/EDGE networks causes 80%+ dropouts. Without local quality gates, 30% of sent images are ungradable blur artifacts.
            </div>
          </div>
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase">National Screening Gap</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Patients at Risk:</span>
                <span className="font-mono font-bold text-slate-100">77,000,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Annual Screened Today:</span>
                <span className="font-mono text-rose-400">&lt; 8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rural Ophthalmologist Ratio:</span>
                <span className="font-mono text-rose-400">1 : 250,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Wait Time:</span>
                <span className="font-mono text-emerald-400">&lt; 2.0 Hours</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      num: 3,
      title: 'End-to-End System Architecture: 5 Interlocking Modules',
      subtitle: 'Unified Shared Struct Contract across Edge and District Server',
      badge: 'System Design',
      content: (
        <div className="space-y-4 py-2">
          <p className="text-xs text-slate-300">
            A modular 5-tier architecture communicating via a unified MATLAB struct (<code className="text-cyan-400 font-mono">dr_struct</code>):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
              <div className="text-[10px] font-mono text-cyan-400 font-bold">MODULE 1</div>
              <div className="font-bold text-slate-200">IQA Edge Gate</div>
              <p className="text-[10px] text-slate-400">Sharpness, Illum, FOV &lt;200ms short-circuit</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
              <div className="text-[10px] font-mono text-indigo-400 font-bold">MODULE 2</div>
              <div className="font-bold text-slate-200">Multi-Head Seg</div>
              <p className="text-[10px] text-slate-400">MAs, Hems, Exudates + NV differencing</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
              <div className="text-[10px] font-mono text-purple-400 font-bold">MODULE 3</div>
              <div className="font-bold text-slate-200">Fused Grading</div>
              <p className="text-[10px] text-slate-400">CNN + 1×6 Morph vector + Temp calibration</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
              <div className="text-[10px] font-mono text-emerald-400 font-bold">MODULE 4</div>
              <div className="font-bold text-slate-200">XAI &amp; DME Triage</div>
              <p className="text-[10px] text-slate-400">Grad-CAM + Macular edema proximity &lt;1DD</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
              <div className="text-[10px] font-mono text-amber-400 font-bold">MODULE 5</div>
              <div className="font-bold text-slate-200">Telemed Sim</div>
              <p className="text-[10px] text-slate-400">SimEvents queue modeling &amp; 3.2KB packet flow</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400">
            Shared Struct Contract: <span className="text-cyan-300">image, preprocessed, iqa_metrics, is_gradable, lesion_masks, features, icdr_grade, confidence, referable_dr, dme_risk, payload_size_kb</span>
          </div>
        </div>
      )
    },
    {
      num: 4,
      title: 'Module 1: Sub-200ms Image Quality Assessment (IQA) Edge Gate',
      subtitle: 'Eliminating Garbage-In Garbage-Out at the Point of Care',
      badge: 'Edge Triage',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-2">
          <div className="space-y-3 text-xs sm:text-sm text-slate-300">
            <p>
              In rural outreach camps, field health workers (ASHAs) frequently capture blurred, out-of-focus, or glare-affected images. 
              Running deep neural networks on degraded images leads to catastrophic false positives.
            </p>
            <div className="space-y-2">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                <span>Sharpness Metric (Laplacian Variance):</span>
                <span className="font-mono text-cyan-400 font-bold">&ge; 0.00015</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                <span>Illumination Bounds (LAB L* channel):</span>
                <span className="font-mono text-cyan-400 font-bold">[8.0, 92.0]</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex justify-between">
                <span>Circular FOV Aperture Coverage:</span>
                <span className="font-mono text-cyan-400 font-bold">&ge; 35%</span>
              </div>
            </div>
            <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs">
              &check; Verified Execution Latency: <strong>80.1 ms</strong> on desktop, <strong>185 ms</strong> on Jetson Orin Nano.
            </div>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2 font-mono">
            <div className="text-cyan-400 font-bold">// Short-Circuit Gate Logic</div>
            <div className="text-slate-400">if ~dr_struct.is_gradable</div>
            <div className="text-slate-400 pl-4">dr_struct.icdr_grade = -1;</div>
            <div className="text-slate-400 pl-4">dr_struct.payload_size_kb = 0.45; // Telemetry only</div>
            <div className="text-amber-400 pl-4">fprintf('[IQA GATE] Aborted: %s\n', reason);</div>
            <div className="text-emerald-400 pl-4">return; // Bypasses Modules 2 &amp; 3!</div>
            <div className="text-slate-400">end</div>
          </div>
        </div>
      )
    },
    {
      num: 5,
      title: 'Module 2: Multi-Head Lesion Segmentation & Anatomy Localization',
      subtitle: 'Shared-Encoder DeepLabv3+ with Separate Morphological Differencing',
      badge: 'Computer Vision',
      content: (
        <div className="space-y-4 py-2 text-xs sm:text-sm text-slate-300">
          <p>
            To prevent computational redundancy on edge hardware, a single backbone encoder extracts feature maps simultaneously 
            for three primary microvascular lesion heads:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="font-bold text-amber-400 block text-xs mb-1">Head 1: Microaneurysms (MAs)</span>
              <p className="text-[11px] text-slate-400">
                Punctate red dots (10-100&mu;m). Key hallmark of Grade 1 Mild NPDR.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="font-bold text-rose-400 block text-xs mb-1">Head 2: Hemorrhages</span>
              <p className="text-[11px] text-slate-400">
                Dot, blot, and flame-shaped hemorrhages. Extensive 4-quadrant involvement indicates Grade 3 Severe NPDR.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="font-bold text-yellow-300 block text-xs mb-1">Head 3: Hard Exudates</span>
              <p className="text-[11px] text-slate-400">
                Lipid leakages. Proximity to fovea center determines clinically significant macular edema (CSME).
              </p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <strong className="text-slate-100">Anatomical Anchors:</strong> Hough Circle Transform and active contours identify 
            Optic Disc Center (1.0 DD standard) and Fovea Center, providing absolute geometric calibration for all distances.
          </div>
        </div>
      )
    },
    {
      num: 6,
      title: 'Module 2 (Dedicated): Neovascularization (NV) Vessel Differencing',
      subtitle: 'Frangi Multiscale Vessel Filtering vs 4th-Head Over-Engineering',
      badge: 'Novel Innovation',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-2">
          <div className="space-y-3 text-xs sm:text-sm text-slate-300">
            <div className="p-3 rounded-lg bg-pink-950/30 border border-pink-500/30 text-pink-200">
              <strong className="text-pink-300 block mb-1">Why NOT a 4th Segmentation Head?</strong>
              Neovascularization is extremely rare (&lt;2% of population) and presents with irregular, tortuous, chaotic vessel geometry. 
              A standard segmentation head suffers extreme class imbalance and catastrophic over-fitting.
            </div>
            <p>
              <strong>Our Algorithmic Innovation:</strong> Multiscale Frangi Hessian matched filtering extracts total vasculature. 
              Normal landmark vessel topology is subtracted, isolating chaotic new vessels (NVD) within 1.0 DD of the optic disc margin.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
            <div className="text-pink-400 font-bold">// Vessel Differencing Pipeline</div>
            <div className="text-slate-400">vessels = frangi_filter(green_clahe, scales=[1, 2, 3]);</div>
            <div className="text-slate-400">major_vessels = morphological_opening(vessels, disk(3));</div>
            <div className="text-cyan-400">nv_candidates = vessels - major_vessels;</div>
            <div className="text-slate-400">disc_margin_zone = optic_disc_annulus(1.0, 2.0);</div>
            <div className="text-emerald-400">has_nv = sum(nv_candidates &amp; disc_margin_zone) &gt; thresh;</div>
          </div>
        </div>
      )
    },
    {
      num: 7,
      title: 'Module 3: Fused Deep-Feature Clinical Grading & Calibration',
      subtitle: 'Combining CNN Representations with 1×6 Handcrafted Biological Priors',
      badge: 'Machine Learning',
      content: (
        <div className="space-y-4 py-2 text-xs sm:text-sm text-slate-300">
          <p>
            Standard black-box CNNs are uninterpretable and fail when subtle microaneurysms are obscured by imaging noise. 
            Our architecture explicitly fuses 128-d deep features with a 1×6 hand-crafted clinical vector:
          </p>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300">
            Vector: [ma_count, hem_count, exudate_area_pct, disc_to_lesion_dist, has_nv, fovea_exudate_dist]
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <strong className="text-slate-100 block text-xs">Two-Stage Domain Adaptation</strong>
              <p className="text-[11px] text-slate-400">
                Pre-trained on EyePACS/Messidor-2 (25k+ images) &rarr; Fine-tuned on Indian clinical datasets (IDRiD &amp; APTOS 2019) with focal cross-entropy loss.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <strong className="text-slate-100 block text-xs">Post-Hoc Temperature Calibration (T = 1.35)</strong>
              <p className="text-[11px] text-slate-400">
                Solves neural network over-confidence. Reduces Expected Calibration Error (ECE) from 0.18 to &lt;0.04, ensuring doctors can trust probability metrics.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      num: 8,
      title: 'Module 4: Explainable AI (XAI) & Macular Edema (DME) Triage',
      subtitle: 'Dual-Layer Grad-CAM Attribution & Standardized Clinician Referral Sheet',
      badge: 'Clinician Trust',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-2">
          <div className="space-y-3 text-xs sm:text-sm text-slate-300">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <strong className="text-cyan-300 block text-xs mb-1">Dual-Layer Grad-CAM Composite</strong>
              Heatmap gradient projections over CLAHE-enhanced fundus verify the model attends to authentic retinal lesions rather than camera dust artifacts.
            </div>
            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-200">
              <strong className="text-amber-300 block text-xs mb-1">Clinical DME Proximity Rule</strong>
              Hard exudates within <strong>1.0 Disc Diameter (DD)</strong> of the foveal center trigger an immediate high-priority Diabetic Macular Edema alert.
            </div>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-slate-200 uppercase tracking-wider">Automated Clinician Summary</div>
            <ul className="space-y-1 text-slate-400 font-mono text-[11px]">
              <li>&bull; Patient ID &amp; PHC Location Metadata</li>
              <li>&bull; 5-Class ICDR Staging + Confidence Score</li>
              <li>&bull; DME Risk Flag + Fovea-Exudate Distance</li>
              <li>&bull; 1-Click Printable Medical PDF for Physical Referral</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      num: 9,
      title: 'Module 5: Discrete-Event Telemedicine Network Simulator',
      subtitle: 'SimEvents Queuing Model: Scenario A (1 Specialist Bottleneck) vs Scenario B',
      badge: 'Operational Telemed',
      content: (
        <div className="space-y-4 py-2 text-xs sm:text-sm text-slate-300">
          <p>
            Screening technology fails in the real world if the operational telemedicine pipeline is overwhelmed. 
            We modeled an entire district telemedicine network in MATLAB SimEvents:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-500/40 space-y-1">
              <strong className="text-rose-300 block text-sm">Scenario A: 1 Specialist Bottleneck</strong>
              <div className="font-mono text-xs text-rose-200 pt-1 space-y-1">
                <div>&bull; Max Queue Backlog: <strong>22 - 28 patients</strong></div>
                <div>&bull; Patient Wait Time: <strong>1.5 - 2.1 hours</strong></div>
                <div>&bull; Status: Critical system failure / queue explosion</div>
              </div>
            </div>
            <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 space-y-1">
              <strong className="text-emerald-300 block text-sm">Scenario B: Recommended Staffing (&ge;2)</strong>
              <div className="font-mono text-xs text-emerald-200 pt-1 space-y-1">
                <div>&bull; Max Queue Backlog: <strong>&lt; 3 patients</strong></div>
                <div>&bull; Patient Wait Time: <strong>&lt; 6 minutes (0.1h)</strong></div>
                <div>&bull; Status: Clinically stable, instant point-of-care feedback</div>
              </div>
            </div>
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-400">
            <strong>Edge Telemetry Benefit:</strong> Transmitting 3.2 KB structured JSON instead of 15 MB raw images cuts bandwidth demand by <strong>4,800&times;</strong>, enabling flawless operation over 2G/EDGE (250 Kbps).
          </div>
        </div>
      )
    },
    {
      num: 10,
      title: 'Multi-Dataset Benchmark Validation Across 5,966+ Images',
      subtitle: 'Benchmarked on APTOS 2019, IDRiD, Messidor-2, and DRIVE',
      badge: 'Validation',
      content: (
        <div className="space-y-4 py-2 text-xs sm:text-sm text-slate-300">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-900 text-slate-400 font-mono border-b border-slate-800">
                  <th className="p-2.5">Dataset</th>
                  <th className="p-2.5">Images</th>
                  <th className="p-2.5">Accuracy</th>
                  <th className="p-2.5">Kappa (QWK)</th>
                  <th className="p-2.5">Sensitivity</th>
                  <th className="p-2.5">Specificity</th>
                  <th className="p-2.5">AUC-ROC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                <tr>
                  <td className="p-2.5 font-bold text-slate-200">APTOS 2019</td>
                  <td className="p-2.5 text-slate-400">3,662</td>
                  <td className="p-2.5 text-slate-200">89.4%</td>
                  <td className="p-2.5 text-cyan-400 font-bold">0.884</td>
                  <td className="p-2.5 text-emerald-400">92.6%</td>
                  <td className="p-2.5 text-emerald-400">88.3%</td>
                  <td className="p-2.5 text-indigo-400">0.946</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-200">IDRiD (India)</td>
                  <td className="p-2.5 text-slate-400">516</td>
                  <td className="p-2.5 text-slate-200">91.2%</td>
                  <td className="p-2.5 text-cyan-400 font-bold">0.902</td>
                  <td className="p-2.5 text-emerald-400">94.1%</td>
                  <td className="p-2.5 text-emerald-400">89.5%</td>
                  <td className="p-2.5 text-indigo-400">0.962</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-200">Messidor-2</td>
                  <td className="p-2.5 text-slate-400">1,748</td>
                  <td className="p-2.5 text-slate-200">92.8%</td>
                  <td className="p-2.5 text-cyan-400 font-bold">0.915</td>
                  <td className="p-2.5 text-emerald-400">95.0%</td>
                  <td className="p-2.5 text-emerald-400">91.2%</td>
                  <td className="p-2.5 text-indigo-400">0.968</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400">
            Exceeds the UK NHS &amp; Indian National Health Mission clinical thresholds (Sensitivity &gt;80%, Specificity &gt;85%).
          </p>
        </div>
      )
    },
    {
      num: 11,
      title: 'Edge Deployment: NVIDIA Jetson Orin Nano & MATLAB Coder',
      subtitle: 'Zero-Cloud Dependency Point-of-Care Hardware Architecture',
      badge: 'Embedded Systems',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-2">
          <div className="space-y-3 text-xs sm:text-sm text-slate-300">
            <p>
              To ensure operation in remote tribal and rural areas with zero internet connectivity, 
              the full diagnostic pipeline runs self-contained on low-power edge hardware.
            </p>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
              <span className="font-bold text-cyan-400 block text-xs">Hardware Profile:</span>
              <div className="text-slate-300 font-mono text-xs">
                NVIDIA Jetson Orin Nano (40 TOPS, 10W Power, &lt;&#8377;35,000 cost)
              </div>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
              <span className="font-bold text-indigo-400 block text-xs">MATLAB Coder &amp; GPU Coder:</span>
              <p className="text-[11px] text-slate-400">
                Automated C/C++ and CUDA code generation exports standalone shared libraries (<code className="text-cyan-300">.so</code>) requiring no MATLAB runtime license on the device.
              </p>
            </div>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
            <div className="font-bold text-slate-200 uppercase tracking-wider">Edge Benchmark Results</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Module 1 IQA Gate:</span>
                <span className="font-mono text-emerald-400 font-bold">42 ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">DeepLabv3+ Backbone:</span>
                <span className="font-mono text-cyan-400 font-bold">118 ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Grading &amp; Fusion Head:</span>
                <span className="font-mono text-cyan-400 font-bold">25 ms</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 font-bold">
                <span className="text-slate-300">Total Inference Latency:</span>
                <span className="font-mono text-emerald-300">185 ms (&lt;200ms target &check;)</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      num: 12,
      title: 'National Impact, Ayushman Bharat Integration & Roadmap',
      subtitle: 'Scalable Point-of-Care Vision Screening for 150,000+ Health & Wellness Centers',
      badge: 'Vision & Impact',
      content: (
        <div className="space-y-4 py-2 text-xs sm:text-sm text-slate-300">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
              <strong className="text-cyan-400 block text-xs">AB-HWC Integration</strong>
              <p className="text-[11px] text-slate-400">
                Direct integration with Ayushman Bharat Digital Mission (ABDM) and electronic health record (ABHA ID) standards.
              </p>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
              <strong className="text-emerald-400 block text-xs">Health Economics</strong>
              <p className="text-[11px] text-slate-400">
                Reduces screening cost from &#8377;1,200 per patient to &lt;&#8377;45. Prevents avoidable blindness in 350,000+ citizens annually.
              </p>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
              <strong className="text-indigo-400 block text-xs">Future Extensions</strong>
              <p className="text-[11px] text-slate-400">
                Expansion to Glaucoma cup-to-disc ratio (CDR) and Hypertensive Retinopathy using the same edge fundus platform.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-900 border border-cyan-500/30 text-center space-y-1">
            <div className="text-slate-100 font-bold text-sm">
              Smart India Hackathon 2026 • AI-Assisted Tele-Ophthalmology
            </div>
            <div className="text-xs text-cyan-300">
              MathWorks Technology Solution: MATLAB &bull; Deep Learning Toolbox &bull; Simulink &bull; SimEvents &bull; MATLAB Coder
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  const prevSlide = () => setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const current = slides[currentSlide];

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-6 flex flex-col justify-between' : ''}`}>
      {/* Top Slide Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Presentation className="h-5 w-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <span>SIH Grand-Finale Presentation Deck</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                Slide {currentSlide + 1} of {slides.length}
              </span>
            </h3>
            <p className="text-xs text-slate-400">Use arrow keys or buttons below to navigate</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Slide Presentation Stage */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 sm:p-8 min-h-[460px] flex flex-col justify-between shadow-2xl relative overflow-hidden">
        {/* Background glow decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Slide Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800">
              {current.badge}
            </span>
            <span className="text-xs font-mono text-slate-500">
              {current.num.toString().padStart(2, '0')} / {slides.length.toString().padStart(2, '0')}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {current.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {current.subtitle}
          </p>
        </div>

        {/* Slide Body */}
        <div className="my-auto py-4">
          {current.content}
        </div>

        {/* Slide Bottom Controls */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          {/* Dots Indicator */}
          <div className="flex space-x-1 sm:space-x-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentSlide ? 'w-6 bg-cyan-400' : 'w-1.5 bg-slate-700 hover:bg-slate-600'
                }`}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-cyan-600/20 transition-all"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
