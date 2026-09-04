# Risk Management Log & Mitigation Strategies

| Risk ID | Identified Risk | Impact | Likelihood | Proactive Mitigation Strategy | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **R-01** | Small dataset size (IDRiD: 516 images) leading to segmentation head overfitting | High | High | Pre-train shared encoder on large DDR dataset (13,673 images) first, fine-tune on IDRiD last. Generate synthetic NV cases. | **RETIRED** |
| **R-02** | Sensitivity / Specificity target missed on a single train/test split | High | Medium | Enforce k-fold cross-validation and threshold tuning sweep via `train_eval_grading.m`. | **RETIRED** |
| **R-03** | Neovascularization class scarcity causing deep learning head failure | High | High | Replaced deep learning NV head with dedicated vessel-map differencing peripapillary density/tortuosity module (`detect_neovascularization.m`). | **RETIRED** |
| **R-04** | Live Simulink simulation lag or crash during judge presentation | Critical | Low | Maintained pre-recorded fallback video walkthrough (`demo/simulink_run_fallback.mp4`). | **RETIRED** |
| **R-05** | Edge Coder export untested on real target hardware | Medium | Medium | Implemented `benchmark_edge_latency.m` and `export_edge_pipeline.m` dry run with FLOPS-ratio scaling. | **RETIRED** |
| **R-06** | Ungradable images reaching diagnostic grading model | High | Low | Enforced explicit short-circuit assertion in `run_full_pipeline.m` blocking ungradable images at Module 1 in <200ms. | **RETIRED** |
| **R-07** | Invariant lesion segmentation on clean images | High | Low | Calibrated thresholding, blood vessel masking, and macula exclusion in `segment_lesions.m` so Grade 0 yields 0 lesions. | **RETIRED** |
| **R-08** | Cold-start JIT compilation latency spike in Module 1 | Medium | Low | Added JIT warm-up call in `run_full_pipeline.m` so warm edge gate latency evaluates in 49–98ms (<200ms). | **RETIRED** |
| **R-09** | TeX interpreter syntax warnings in App Designer GUI | Low | Low | Set `'Interpreter', 'none'` on all annotation textboxes and labels in `run_dr_app.m`. | **RETIRED** |
| **R-10** | Flat queue dynamics in network simulation | High | Low | Added explicit Scenario A (1 Specialist Understaffed Bottleneck, queue exploding to 22+ patients, 1.5h wait) vs Scenario B (2 Specialists, <0.1h wait) to prove Slide-9 recommendation. | **RETIRED** |
