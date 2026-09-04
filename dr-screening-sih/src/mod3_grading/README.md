# Module 3: ICDR Severity Grading & Feature Fusion

## Description
Module 3 predicts the 5-point ICDR DR Severity Grade (0: No DR, 1: Mild, 2: Moderate, 3: Severe, 4: PDR).
It enforces an **explicit lesion-aware feature fusion architecture**: concatenating the global CNN feature vector (EfficientNet-B0 backbone with ResNet-50 fallback) with Module 2's quantitative hand-crafted feature vector (MA count, hemorrhage count, exudate area %, disc-to-lesion distance, NV flag, DME distance).

It incorporates a two-stage domain adaptation training workflow (EyePACS/MESSIDOR-2 pre-training → IDRiD/APTOS fine-tuning with class-weighted loss) and tunes the referable DR operating point to clear **Sensitivity > 90%** and **Specificity > 85%** simultaneously.

## Key Dependencies & Toolboxes
- **Deep Learning Toolbox**: `trainNetwork`, `layerGraph`, `perfcurve`, `confusionchart`
- **Deep Network Designer App**
- **Experiment Manager App**

## Function Specifications
- `build_fused_model.m`: Constructs fused neural network architecture (EfficientNet-B0 primary, ResNet-50 fallback).
- `predict_icdr_grade.m`: Fused inference routine returning grade (0-4), referable DR status, and calibrated softmax confidence.
- `train_eval_grading.m`: Executes two-stage domain-adaptation training, k-fold validation, ROC curve (`perfcurve`), and threshold tuning.
- `test_mod3.m`: Standalone verification test.

## Standalone Execution
To test Module 3 independently in MATLAB:
```matlab
addpath('dr-screening-sih/src/mod3_grading');
test_mod3();
```
