# Module 4: Clinician-Centric XAI & PDF Report Generator

## Description
Module 4 translates model predictions into actionable visual and quantitative clinical evidence.
It generates a dual-layer **Grad-CAM attribution map** alpha-composited with multi-colored lesion masks over the CLAHE fundus image, calculates Diabetic Macula Edema (**DME risk**) based on hard exudate distance to the fovea, applies temperature scaling confidence calibration, and outputs a structured **PDF Clinician Sheet** in < 30 seconds for rapid clinician review.

## Key Dependencies & Toolboxes
- **Deep Learning Toolbox**: `gradCAM`
- **MATLAB Report Generator**: `mlreportgen.dom` / `exportgraphics`

## Function Specifications
- `generate_gradcam_overlay.m`: Visual grounding attribution map + multi-colored lesion overlay.
- `check_dme_risk.m`: Calculates exudate-to-fovea distance in optic disc diameters (flags DME risk if <= 1.0 DD).
- `calibrate_confidence.m`: Temperature scaling calibration scalar (T=1.35).
- `generate_clinician_report.m`: Generates structured PDF report with Patient ID, color-coded grade, DME flag, lesion table, and overlay image.
- `test_mod4.m`: Standalone verification test.

## Standalone Execution
To test Module 4 independently in MATLAB:
```matlab
addpath('dr-screening-sih/src/mod1_iqa');
addpath('dr-screening-sih/src/mod2_segmentation');
addpath('dr-screening-sih/src/mod3_grading');
addpath('dr-screening-sih/src/mod4_xai_report');
test_mod4();
```
