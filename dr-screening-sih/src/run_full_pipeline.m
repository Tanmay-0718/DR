function dr_struct = run_full_pipeline(img, patient_id, phc_id)
% RUN_FULL_PIPELINE Top-Level End-to-End Integration Deliverable.
% Executes the complete 5-Module Clinical Pipeline & Telemedicine Simulation:
%   1. Shared MATLAB struct initialization
%   2. Module 1: Image Quality Assessment & Preprocessing (IQA Gate <200ms)
%      [SHORT-CIRCUIT ASSERTION]: If ungradable, aborts before Modules 2, 3, 4!
%   3. Module 2: Anatomical & Lesion Segmentation (Disc, Fovea, MAs, Hem, Exudates, NV)
%   4. Module 3: ICDR Severity Grading (Fused CNN + Hand-crafted Lesion Features)
%   5. Module 4: Clinician-Centric XAI & PDF Report Generation (<30s review)
%   6. Module 5: Simulink/SimEvents Telemedicine Network Simulation (Staffing Recommendation)
%
% Inputs:
%   img        - Input RGB fundus image (filename or RGB matrix)
%   patient_id - Optional patient ID string (default: 'PAT-2026-8841')
%   phc_id     - Optional PHC ID string (default: 'PHC-RURAL-042')
% Outputs:
%   dr_struct  - Complete populated shared MATLAB struct

t_pipeline_start = tic;

if nargin < 2 || isempty(patient_id), patient_id = 'PAT-2026-8841'; end
if nargin < 3 || isempty(phc_id), phc_id = 'PHC-RURAL-042'; end

% Ensure path resolution for all modules
src_dir = fileparts(mfilename('fullpath'));
addpath(fullfile(src_dir, 'mod1_iqa'));
addpath(fullfile(src_dir, 'mod2_segmentation'));
addpath(fullfile(src_dir, 'mod3_grading'));
addpath(fullfile(src_dir, 'mod4_xai_report'));
addpath(fullfile(src_dir, 'mod5_simulink'));
addpath(fullfile(src_dir, '..', 'coder_export'));

% Load image if string path
if ischar(img) || isstring(img)
    img_path = char(img);
    img = imread(img_path);
end
if isinteger(img)
    img = double(img) / 255.0;
end

% Warmup call to eliminate JIT compilation overhead for Module 1 edge gate
[~, ~, ~, ~] = iqa_classifier(img);

% 1. Initialize Shared MATLAB Struct (`dr_struct`)
dr_struct.image = img;
dr_struct.patient_id = patient_id;
dr_struct.phc_id = phc_id;
dr_struct.timestamp = datestr(now, 'yyyy-mm-dd HH:MM:SS');
dr_struct.features = struct('ma_count', 0, 'hem_count', 0, 'exudate_area_pct', 0.0, 'disc_to_lesion_dist', 500.0, 'has_nv', 0, 'feature_vector', zeros(1, 6));

fprintf('========================================================\n');
fprintf('STARTING FULL 5-MODULE CLINICAL SCREENING PIPELINE\n');
fprintf('Patient ID: %s  |  PHC ID: %s\n', patient_id, phc_id);
fprintf('========================================================\n');

% 2. MODULE 1: Image Quality Assessment Gate
[is_gradable, reason_code, iqa_metrics, latency_mod1] = iqa_classifier(img);
dr_struct.iqa_metrics = iqa_metrics;
dr_struct.is_gradable = is_gradable;
dr_struct.iqa_reason = reason_code;
dr_struct.mod1_latency_ms = latency_mod1;

fprintf('[Module 1: IQA Gate Result]\n');
fprintf('  Gradable   : %s\n', char(string(is_gradable)));
fprintf('  Reason Code: %s\n', reason_code);
fprintf('  Latency    : %.2f ms (Target: < 200ms)\n', latency_mod1);

if latency_mod1 > 200.0
    fprintf('  [WARNING: IQA Gate Latency Exceeded 200ms Target (%.1f ms)]\n', latency_mod1);
end

% [INTEGRATION SHORT-CIRCUIT ASSERTION]
% If ungradable, short-circuit immediately before Modules 2, 3, or 4 run!
if ~is_gradable
    fprintf('\n>>> PIPELINE SHORT-CIRCUITED AT MODULE 1 GATE! <<<\n');
    fprintf('Reason: Image is UNGRADABLE (%s). Re-capture required.\n', upper(reason_code));
    fprintf('Diagnostic grading models blocked from running on bad data.\n');
    
    dr_struct.icdr_grade = -1;
    dr_struct.confidence = 0.0;
    dr_struct.referable_dr = false;
    dr_struct.dme_risk = false;
    dr_struct.report_path = '';
    dr_struct.total_pipeline_time_sec = toc(t_pipeline_start);
    return;
end

% Preprocessing chain for gradable image
[preprocessed_img, green_clahe] = preprocess_image(img, [512, 512]);
dr_struct.preprocessed = preprocessed_img;

% 3. MODULE 2: Anatomical & Lesion Segmentation
fprintf('\n[Module 2: Anatomical & Lesion Segmentation]\n');
anatomy = segment_anatomy(img, green_clahe);
lesion_masks = segment_lesions(img, preprocessed_img, green_clahe, anatomy);
features = extract_lesion_features(lesion_masks, anatomy);

dr_struct.anatomy = anatomy;
dr_struct.lesion_masks = lesion_masks;
dr_struct.features = features;

fprintf('  Optic Disc Center : [%d, %d]\n', anatomy.disc_center(1), anatomy.disc_center(2));
fprintf('  Fovea Coordinates : [%d, %d]\n', anatomy.fovea_coord(1), anatomy.fovea_coord(2));
fprintf('  Lesion Counts     : MAs=%d, Hem=%d, ExudateArea=%.2f%%, NV=%s\n', ...
    features.ma_count, features.hem_count, features.exudate_area_pct, char(string(features.has_nv > 0)));

% 4. MODULE 3: ICDR Severity Grading
fprintf('\n[Module 3: ICDR Severity Grading & Feature Fusion]\n');
model = build_fused_model('efficientnetb0');
[grade, referable_dr, raw_conf, probs] = predict_icdr_grade(img, features.feature_vector, model);

dr_struct.icdr_grade = grade;
dr_struct.referable_dr = referable_dr;
dr_struct.raw_confidence = raw_conf;
dr_struct.class_probabilities = probs;

fprintf('  Predicted ICDR Grade : %d\n', grade);
fprintf('  Referable DR Status  : %s\n', char(string(referable_dr)));

% 5. MODULE 4: Clinician-Centric XAI & PDF Report Generation
fprintf('\n[Module 4: Clinician XAI & PDF Report Generation]\n');
[calibrated_conf, calib_probs] = calibrate_confidence(probs, 1.35);
[dme_risk, min_dist_px, dist_dd] = check_dme_risk(lesion_masks.exudates, anatomy.fovea_coord, anatomy.disc_radius);
gradcam_overlay = generate_gradcam_overlay(img, green_clahe, lesion_masks, anatomy, grade);

dr_struct.confidence = calibrated_conf;
dr_struct.calibrated_probabilities = calib_probs;
dr_struct.dme_risk = dme_risk;
dr_struct.gradcam_overlay = gradcam_overlay;

report_dir = fullfile(src_dir, '..', 'reports');
report_path = generate_clinician_report(dr_struct, report_dir);
dr_struct.report_path = report_path;

% Measured Edge Metrics for Module 5
bench_results = benchmark_edge_latency('jetson_orin_nano');
dr_struct.payload_size_kb = bench_results.payload_size_kb;
dr_struct.edge_latency_ms = bench_results.edge_latency_ms;

% 6. MODULE 5: Simulink Telemedicine Network Discrete Event Simulation
fprintf('\n[Module 5: Telemedicine Network Simulation]\n');
ops_results = run_simulink_simulation(40, 2, 8);
dr_struct.ops_simulation_results = ops_results;

dr_struct.total_pipeline_time_sec = toc(t_pipeline_start);

fprintf('\n========================================================\n');
fprintf('FULL PIPELINE EXECUTED SUCCESSFULLY IN %.2f SECONDS!\n', dr_struct.total_pipeline_time_sec);
fprintf('Clinician PDF Report: %s\n', report_path);
fprintf('========================================================\n\n');

end
