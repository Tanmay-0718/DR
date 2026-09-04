# Demo Fallback Assets & Execution Guide

## Description
This directory contains demo-day fallback artifacts and screen recordings to protect against live demo lag, network disruptions, or GPU hardware unavailability during the judge presentation.

## Included Artifacts
- `simulink_run_fallback.mp4` / `simulink_demo_script.m`: Pre-recorded high-resolution walkthrough of Module 5 SimEvents telemed simulation running in real time.
- `ops_chart_fallback.png`: High-resolution operations chart (`telemed_operations_chart.png`).

## Live Demo Rules
1. **Primary Route**: Execute live demo using `app/run_dr_app.m` or `src/run_full_pipeline.m`.
2. **Fallback Trigger**: If Simulink execution stutters or GPU rendering lags, seamlessly switch to `simulink_run_fallback.mp4` without breaking pitch momentum. Disclose the fallback only if explicitly asked by judges.
