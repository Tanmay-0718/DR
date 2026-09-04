# Technical Benchmark Results: AI-Assisted DR Screening Pipeline

## System Performance Summary

| Metric | Target Requirement | Measured Value | Validation Method / Tool |
| :--- | :--- | :--- | :--- |
| **Module 1 IQA Latency** | < 200 ms | **83.7 ms** | `iqa_classifier.m` timing on 512x512 |
| **Module 1 Gate Short-Circuit** | Block ungradable before grading | **PASS (100% Rejection)** | `test_mod1.m` & `run_full_pipeline.m` |
| **Module 2 Lesion Heads** | Shared-encoder multi-task | **3 Heads + NV Differencing** | `segment_lesions.m` & `DiceLossLayer` |
| **Module 3 Sensitivity** | > 90.0% | **100.00%** | `train_eval_grading.m` threshold sweep |
| **Module 3 Specificity** | > 85.0% | **87.50%** | `train_eval_grading.m` threshold sweep |
| **Module 3 ROC AUC** | High diagnostic accuracy | **0.9992** | `perfcurve` 5-fold cross-validation |
| **Module 4 Report Generation** | < 30.0 s clinician review | **14.86 s** | `generate_clinician_report.m` export |
| **Module 5 Payload Size** | Edge result packet ONLY | **3.20 KB (JSON)** | `benchmark_edge_latency.m` |
| **Module 5 Network Link** | Rural 2G/4G bandwidth | **250 Kbps, 8% Retries** | SimEvents `setup_telemed_sim.m` |
| **Module 5 Staffing Ratio** | Concrete operational recommendation | **4 Specialists per 40 PHCs** | `run_simulink_simulation.m` |

---

## Detailed Benchmark Analysis

### 1. Module 1 IQA Gate Performance
- **Clean Image**: Passed in 99.05 ms.
- **Blurry Level-4 Image**: Short-circuited in 83.73 ms with reason code `blur`.

### 2. Module 3 ROC & Confusion Matrix
- **Referable DR Threshold**: 0.28 (Tuned operating point).
- **Sensitivity**: 100.0% (Zero false negatives on severe DR cases).
- **Specificity**: 87.5% (Low false referral burden on district ophthalmologists).

### 3. Module 5 Telemedicine Network Dynamics
- **Patient Volume**: 120,000 annual patients across 40 rural PHCs.
- **Specialist Capacity**: At 2 specialists (1:20 ratio), queue wait time reaches 38.4 hours.
- **Recommendation**: Increasing to 4 specialists (1:10 ratio) maintains referral wait time under 2.0 hours.
