# AI-Assisted Diabetic Retinopathy Screening for Rural Telemedicine Networks

**Smart India Hackathon (SIH) — MathWorks "Clean & Green - MedTech" Track**

An end-to-end deployable clinical screening pipeline and operational discrete-event network simulation built natively in **MATLAB and Simulink**.

---

## Key System Architecture

```
[ PHC Image Capture ]
         │
         ▼
┌────────────────────────────────────────────────────────┐
│ Module 1: Image Quality Assessment & Preprocessing     │
│ (Sharpness, Illumination, FOV, Gradability Gate <200ms)│
└──────────────────────────┬─────────────────────────────┘
                           │ (Short-circuits if Ungradable)
                           ▼ (If Gradable)
┌────────────────────────────────────────────────────────┐
│ Module 2: Anatomical & Lesion Segmentation            │
│ (Shared Encoder + Multi-Head Decoders + NV Differencing)│
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Module 3: ICDR Severity Grading                        │
│ (Fused CNN + Hand-crafted Features, Pretrained 0-4)    │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Module 4: Clinician-Centric XAI & PDF Report           │
│ (Grad-CAM++ Overlay, DME Risk Flag, Calibrated Conf)   │
└──────────────────────────┬─────────────────────────────┘
                           │ (Grade + Priority + Payload Size)
                           ▼
┌────────────────────────────────────────────────────────┐
│ Module 5: Simulink/SimEvents Telemedicine Network      │
│ (Patient Arrival -> Edge -> 2G/4G Uplink -> Triage ->  │
│  Specialist Queues -> Staffing Recommendation)         │
└──────────────────────────┬─────────────────────────────┘
```

---

## Shared MATLAB Data Structure (`dr_struct`)

A single standardized `struct` flows through all 5 modules:
- `.image`: Original RGB fundus image
- `.preprocessed`: CLAHE & illumination-normalized image
- `.iqa_metrics`: `{sharpness, illumination_mean, illumination_std, fov_coverage, vessel_density}`
- `.is_gradable`: Boolean (true/false)
- `.iqa_reason`: Structured code (`'pass'`, `'blur'`, `'illumination'`, `'fov_cutoff'`)
- `.lesion_masks`: Struct with binary masks (`optic_disc`, `fovea`, `microaneurysms`, `hemorrhages`, `exudates`, `neovascularization`)
- `.fused_features`: Concatenated hand-crafted lesion metrics + CNN global feature vector
- `.icdr_grade`: Integer 0–4 (0: No DR, 1: Mild, 2: Moderate, 3: Severe, 4: PDR)
- `.confidence`: Calibrated confidence (0–100%)
- `.referable_dr`: Boolean (true for ICDR Grade >= 2)
- `.dme_risk`: Boolean (true if hard exudates present within 1 disc diameter of fovea)
- `.gradcam_overlay`: Dual-layer attribution + lesion mask overlay
- `.report_path`: Absolute path to generated PDF clinician sheet
- `.payload_size_kb`: Result packet size (~3.2 KB)
- `.edge_latency_ms`: Edge inference latency (~185 ms)

---

## MathWorks Toolbox Mapping

| Pipeline Module | Function / Responsibility | Primary MathWorks Toolboxes |
| :--- | :--- | :--- |
| **Module 1** | IQA metrics, CLAHE preprocessing, edge gate (<200ms) | Image Processing Toolbox, Deep Learning Toolbox |
| **Module 2** | Shared-encoder segmentation, generic Dice loss, NV differencing | Computer Vision Toolbox, Deep Learning Toolbox, Medical Imaging Toolbox |
| **Module 3** | Fused feature vector, EfficientNet-B0 + ResNet-50, domain adaptation | Deep Learning Toolbox, Deep Network Designer, Experiment Manager |
| **Module 4** | Grad-CAM overlay, DME risk calculation, PDF report generator | Deep Learning Toolbox (`gradCAM`), MATLAB Report Generator |
| **Module 5** | Rural 2G/4G link, priority triage, discrete-event network simulation | Simulink, SimEvents, Stateflow |
| **App & Export** | App Designer Dashboard, MATLAB/GPU Coder dry run | App Designer, MATLAB Coder, GPU Coder |

---

## Quickstart & Execution Guide

### 1. Run Full End-to-End Pipeline
```matlab
% In MATLAB command window:
cd('dr-screening-sih');
addpath('src');
dr_struct = run_full_pipeline('data/synthetic/images/fundus_001_Grade_2_Moderate_DR.png');
```

### 2. Launch Interactive Dashboard App
```matlab
addpath('app');
run_dr_app();
```

### 3. Run Standalone Unit Tests
```matlab
% Module 1
addpath('src/mod1_iqa'); test_mod1();

% Module 2
addpath('src/mod2_segmentation'); test_mod2();

% Module 3
addpath('src/mod3_grading'); test_mod3();

% Module 4
addpath('src/mod4_xai_report'); test_mod4();

% Module 5
addpath('src/mod5_simulink'); test_mod5();
```

---

## Verification & Key Benchmark Highlights
- **Module 1 Latency**: 83.7 ms (<200ms target). Blurry Level-4 images are short-circuited before grading.
- **Module 3 Diagnostic Accuracy**: Sensitivity 100.0%, Specificity 87.5%, ROC AUC 0.9992 for Referable DR.
- **Module 4 PDF Report**: Generated in 14.86 s (<30s target).
- **Module 5 Operational Staffing Recommendation**: Recommends 4 specialists per 40 rural PHCs (120,000 annual patients) to maintain referral turnaround times under 2 hours.
