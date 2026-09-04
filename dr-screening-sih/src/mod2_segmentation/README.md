# Module 2: Anatomical & Lesion Segmentation

## Description
Module 2 segments key anatomical landmarks (Optic Disc and Fovea) and pathological lesions (Microaneurysms, Hemorrhages, Hard Exudates, and Neovascularization).
It enforces a **shared-encoder multi-task architecture** for MAs, Hemorrhages, and Exudates, uses a custom generic **Dice Loss Layer** to handle extreme class imbalance, and executes dedicated **vessel-map differencing** for Neovascularization (NV) detection near the optic disc margin.

## Key Dependencies & Toolboxes
- **Computer Vision Toolbox**: `imbinarize`, `regionprops`, `bwconncomp`, `bwmorph`, `bwskel`
- **Deep Learning Toolbox**: `DiceLossLayer`, `imageDatastore`
- **Medical Imaging Toolbox**: `adapthisteq`, `imgaussfilt`

## Function Specifications
- `segment_anatomy.m`: Detects Optic Disc binary mask and Fovea coordinates.
- `DiceLossLayer.m`: Custom soft Dice Loss regression layer for MATLAB Deep Learning Toolbox.
- `segment_lesions.m`: Multi-head lesion segmentation (MAs, Hemorrhages, Exudates).
- `detect_neovascularization.m`: Vessel-map differencing peripapillary density/tortuosity module.
- `extract_lesion_features.m`: Computes quantitative 1x6 feature vector for Module 3 feature fusion.
- `test_mod2.m`: Standalone verification test.

## Standalone Execution
To test Module 2 independently in MATLAB:
```matlab
addpath('dr-screening-sih/src/mod1_iqa');
addpath('dr-screening-sih/src/mod2_segmentation');
test_mod2();
```
