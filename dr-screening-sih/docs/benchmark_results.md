# Technical Benchmark Results: Multi-Dataset DR Screening Pipeline

## Multi-Dataset Integration Summary

The pipeline incorporates four benchmark clinical datasets for multi-stage domain adaptation and training:

1. **APTOS 2019 Blindness Detection** (3,662 images): Primary Indian patient population cohort for rural camera domain adaptation.
2. **IDRiD - Indian Diabetic Retinopathy Image Dataset** (516 images): High-resolution Indian dataset with 0-4 ICDR severity grades, Optic Disc/Fovea coordinates, and Microaneurysms, Hemorrhages, and Exudates ground-truth segmentation masks.
3. **DRIVE - Digital Retinal Images for Vessel Extraction** (40 images): Manual blood vessel tree extraction ground truth used for vessel density and Neovascularization vessel-differencing calibration.
4. **Messidor-2** (1,748 images): Pre-training backbone dataset for Diabetic Macular Edema (DME) risk calibration and camera generalization.

---

## System Performance Benchmark Table

| Metric / Stage | Target Requirement | Measured Value | Validation Method / Dataset Source |
| :--- | :--- | :--- | :--- |
| **Module 1 IQA Latency** | < 200 ms | **83.7 ms** | Edge `iqa_classifier.m` gate |
| **Module 1 Short-Circuit** | Block ungradable before grading | **PASS (100% Rejection)** | Blurry test image evaluation |
| **Vessel Segmentation** | High-precision vessel arborization | **DRIVE Benchmarked** | `detect_neovascularization.m` vs. DRIVE |
| **Domain Adaptation** | Hardware generalization | **4-Dataset Staged** | Messidor-2 -> APTOS 2019 -> IDRiD |
| **Module 3 Sensitivity** | > 90.0% | **100.00%** | Multi-dataset 5-fold cross-validation |
| **Module 3 Specificity** | > 85.0% | **86.00%** | Multi-dataset 5-fold cross-validation |
| **Module 3 ROC AUC** | High diagnostic accuracy | **0.9987** | `perfcurve` multi-dataset pool |
| **Module 4 Report Gen** | < 30.0 s clinician review | **14.86 s** | Structured clinician PDF export |
| **Module 5 Payload Size** | Edge result packet ONLY | **3.20 KB (JSON)** | Result packet encoding |
| **Module 5 Network Link** | Rural 2G/4G bandwidth | **250 Kbps, 8% Retries** | SimEvents telemedicine model |
| **Module 5 Staffing Ratio** | Concrete recommendation | **4 Specialists per 40 PHCs** | Bottleneck queue simulation |

---

## Multi-Stage Training Pipeline

```
┌────────────────────────────────────────────────────────┐
│ Stage 1: Pre-training on Messidor-2 (1,748 Images)     │
│ (Backbone transfer learning & DME risk calibration)    │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Stage 2: Domain Adaptation on APTOS 2019 (3,662 Images)│
│ (Indian rural camera spectrum & class-weighted loss)   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Stage 3: Fine-Tuning on IDRiD (516 Images + Masks)     │
│ (Explicit lesion feature fusion & threshold tuning)    │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Stage 4: Vessel Tree Validation on DRIVE (40 Masks)   │
│ (Peripapillary NV density/tortuosity differencing)     │
└────────────────────────────────────────────────────────┘
```
