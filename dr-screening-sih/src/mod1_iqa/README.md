# Module 1: Image Quality Assessment & Preprocessing (IQA Gate)

## Description
Module 1 evaluates fundus image quality prior to deep learning segmentation and grading. It acts as an independent edge gate that executes in < 200 ms. If an image is ungradable (blurry, poorly illuminated, or truncated FOV), the gate short-circuits the pipeline and returns a structured reason code (`blur`, `illumination`, `fov_cutoff`).

## Key Dependencies & Toolboxes
- **Image Processing Toolbox**: `imgradient`, `fspecial('laplacian')`, `imbinarize`, `adapthisteq`, `imgaussfilt`, `rgb2lab`
- **Deep Learning Toolbox**: `imageDatastore`

## Function Specifications
- `compute_iqa_metrics.m`: Calculates Laplacian variance sharpness, LAB illumination mean/std, FOV coverage, and vessel density.
- `iqa_classifier.m`: Evaluates metrics against edge thresholds in < 200 ms.
- `preprocess_image.m`: Applies green channel CLAHE, background illumination subtraction, and resizes/pads image for backbone input.
- `test_mod1.m`: Standalone verification test.

## Standalone Execution
To test Module 1 independently in MATLAB:
```matlab
addpath('dr-screening-sih/src/mod1_iqa');
test_mod1();
```
