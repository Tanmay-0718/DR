import React from 'react';
import { 
  X, 
  HelpCircle, 
  CheckCircle2, 
  Cpu, 
  Layers, 
  ShieldAlert, 
  BookOpen,
  Sparkles
} from 'lucide-react';

export default function JudgeQADrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  const faqs = [
    {
      q: 'Why not just use a standard monolithic CNN like ResNet-50?',
      a: 'A standard monolithic CNN functions as an uninterpretable black box. In medical diagnostics, clinicians cannot verify why the model flagged Grade 3 vs Grade 2. Our architecture uses a shared-encoder multi-head design that explicitly outputs segmented lesion counts (MAs, Hemorrhages, Exudates) and anatomical landmarks. These morphological counts form a 1x6 hand-crafted clinical vector fused with deep embeddings, guaranteeing clinical interpretability, exact DME proximity calculation, and zero hallucinations.'
    },
    {
      q: 'Why did you use Simulink & SimEvents instead of a basic Python M/M/c queuing script?',
      a: 'Standard M/M/c queuing theory assumes memoryless Poisson service times and static server capacities. Real rural telemedicine networks experience non-stationary bursty patient arrivals, packet loss and retries over 2G/EDGE wireless channels, and priority triage routing where Grade 4 PDR cases preempt routine screenings. SimEvents provides deterministic entity-level discrete-event simulation, modeling re-transmissions, priority queues, and specialist shift limits accurately.'
    },
    {
      q: 'How does the system generalize to novel camera hardware and Indian eye pigmentation?',
      a: 'Retinal pigmentation in the Indian population exhibits darker choroidal background tones compared to Western datasets. We solved this with a two-stage clinical domain adaptation strategy: pre-training on EyePACS/Messidor-2, followed by fine-tuning on Indian datasets (IDRiD and APTOS 2019) using class-weighted focal cross-entropy loss. Module 1 also normalizes luminance across [8.0, 92.0] in LAB color space, neutralizing camera sensor variations.'
    },
    {
      q: 'What happens when an ASHA worker submits a blurry or glare-affected photo?',
      a: 'Module 1 acts as an autonomous edge gate. In under 100ms, it evaluates Laplacian variance sharpness, illumination bounds, and circular FOV. If the image fails (e.g. sharpness < 0.00015), the pipeline immediately short-circuits: Modules 2 and 3 are aborted, saving edge compute and preventing false positives, while the ASHA worker receives instant re-capture guidance.'
    },
    {
      q: 'What happens if a user uploads scenery, a document, or a non-fundus photo instead of an eye?',
      a: 'We built a dedicated Anatomical Gatekeeper Mini-Model that executes as Gate 0 before any deep learning inference. It inspects retinal pigment epithelium (RPE) chromatic dominance (R/(R+G+B) > 0.38), blue-to-red ocular media attenuation (B/R < 0.65), cool-color spectrum contamination (<8% sky/foliage pixels), and circular optical vignetting. If a non-retinal photo is detected, the entire pipeline immediately aborts in under 80ms, eliminating out-of-distribution hallucinations.'
    },
    {
      q: 'Why did you separate Neovascularization (NV) into vessel differencing rather than a 4th segmentation head?',
      a: 'Neovascularization is present in less than 2% of screening populations. Training a 4th deep segmentation head on such extreme class imbalance causes either complete non-detection or severe false positive hallucination on normal vessels. Our dedicated vessel-differencing module applies multiscale Frangi matched filtering and subtracts normal landmark vessel topology within 1.0 DD of the optic disc, isolating fragile new vessel fronds with high specificity.'
    },
    {
      q: 'How did you calibrate model confidence for clinical safety?',
      a: 'Modern deep neural networks suffer from over-confidence. We applied post-hoc temperature scaling (T = 1.35) on the validation logits. This reduced the Expected Calibration Error (ECE) below 0.04, ensuring that a 90% confidence prediction corresponds to true 90% clinical probability.'
    }
  ];

  const toolboxes = [
    { name: 'Image Processing Toolbox', usage: 'CLAHE enhancement, morphological operations, Hough transforms, circular FOV masking' },
    { name: 'Computer Vision Toolbox', usage: 'Frangi multiscale vessel filtering, anatomical landmark detection' },
    { name: 'Deep Learning Toolbox', usage: 'DeepLabv3+ multi-head segmentation, ResNet-50 embeddings, feature fusion classifier' },
    { name: 'Simulink & SimEvents', usage: 'Discrete-event queue modeling, rural packet loss/retries, specialist triage dynamics' },
    { name: 'Stateflow', usage: 'Finite-state machine for edge quality gating and short-circuit exception handling' },
    { name: 'MATLAB Coder & GPU Coder', usage: 'C/C++ and CUDA code generation for standalone NVIDIA Jetson deployment' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 space-y-6 shadow-2xl">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Judge Q&amp;A Technical Defense
              </h3>
              <p className="text-xs text-slate-400">
                Architectural justifications &amp; MathWorks toolbox mapping
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* MathWorks Toolboxes Mapping */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
            <Cpu className="h-4 w-4 text-cyan-400" />
            <span>MathWorks Ecosystem Utilization</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {toolboxes.map((t, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-0.5">
                <span className="font-bold text-cyan-300">{t.name}</span>
                <p className="text-[11px] text-slate-400">{t.usage}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Defense FAQs */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-indigo-400" />
            <span>Grand Finale Defense Q&amp;A</span>
          </h4>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="font-bold text-xs sm:text-sm text-slate-100 flex items-start space-x-2">
                  <span className="text-cyan-400 font-mono">Q{idx + 1}:</span>
                  <span>{faq.q}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-6 border-l-2 border-slate-800">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
}
