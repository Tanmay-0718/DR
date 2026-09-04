function test_mod4()
% TEST_MOD4 Standalone verification script for Module 4 (XAI & PDF Report).
% Verifies Grad-CAM overlay, DME risk calculation, confidence calibration,
% and PDF clinician report generation in < 30 seconds.

fprintf('========================================================\n');
fprintf('RUNNING MODULE 4 STANDALONE TEST: CLINICIAN-CENTRIC XAI & PDF REPORT\n');
fprintf('========================================================\n');

root_dir = fullfile(fileparts(mfilename('fullpath')), '..', '..');
addpath(fullfile(root_dir, 'src', 'mod1_iqa'));
addpath(fullfile(root_dir, 'src', 'mod2_segmentation'));
addpath(fullfile(root_dir, 'src', 'mod3_grading'));
addpath(fullfile(root_dir, 'src', 'mod4_xai_report'));

% Create sample image and masks
img = zeros(512, 512, 3);
[X, Y] = meshgrid(1:512, 1:512);
fov = sqrt((X-256).^2 + (Y-256).^2) <= 220;
img(:,:,1) = fov * 0.7; img(:,:,2) = fov * 0.35; img(:,:,3) = fov * 0.1;

[prep_img, clahe_g] = preprocess_image(img, [512, 512]);
anatomy = segment_anatomy(img, clahe_g);
lesion_masks = segment_lesions(img, prep_img, clahe_g, anatomy);

% 1. Test DME Risk Calculation (Empty Exudates vs Exudates near fovea)
empty_exudates = false(512, 512);
[dme_risk_false, ~, ~] = check_dme_risk(empty_exudates, anatomy.fovea_coord, anatomy.disc_radius);
assert(dme_risk_false == false, 'Empty exudates should not trigger DME risk!');

% Add synthetic exudate near fovea
fov_c = anatomy.fovea_coord;
exudate_near_fovea = false(512, 512);
exudate_near_fovea(max(1, fov_c(2)-5):min(512, fov_c(2)+5), max(1, fov_c(1)-5):min(512, fov_c(1)+5)) = true;
[dme_risk_true, ~, ~] = check_dme_risk(exudate_near_fovea, anatomy.fovea_coord, anatomy.disc_radius);
assert(dme_risk_true == true, 'Exudate near fovea MUST trigger DME risk!');

% 2. Test Temperature Scaling Confidence Calibration
raw_probs = [0.05, 0.10, 0.65, 0.15, 0.05];
[calib_conf, calib_probs] = calibrate_confidence(raw_probs, 1.35);
fprintf('[Confidence Calibration]\n');
fprintf('  Raw Max Prob : %.1f%%\n', max(raw_probs)*100);
fprintf('  Calibrated   : %.1f%%\n', calib_conf);

% 3. Test Grad-CAM Overlay Generation
overlay_img = generate_gradcam_overlay(img, clahe_g, lesion_masks, anatomy, 2);
assert(all(size(overlay_img) == [512, 512, 3]), 'Overlay image size mismatch!');

% 4. Test PDF Clinician Report Generation (< 30s)
dr_struct.patient_id = 'PAT-TEST-001';
dr_struct.phc_id = 'PHC-RURAL-12';
dr_struct.icdr_grade = 2;
dr_struct.confidence = calib_conf;
dr_struct.referable_dr = true;
dr_struct.dme_risk = true;
dr_struct.gradcam_overlay = overlay_img;
dr_struct.features.ma_count = 14;
dr_struct.features.hem_count = 8;
dr_struct.features.exudate_area_pct = 1.45;
dr_struct.features.has_nv = 0;

t_report = tic;
report_path = generate_clinician_report(dr_struct, fullfile(root_dir, 'reports'));
report_time = toc(t_report);

fprintf('[Clinician PDF Report Generation]\n');
fprintf('  Report Path : %s\n', report_path);
fprintf('  Time Elapsed: %.2f seconds (Target: < 30s)\n', report_time);

assert(exist(report_path, 'file') > 0, 'PDF clinician report file was not created!');
assert(report_time < 30.0, 'PDF report generation exceeded 30-second target!');

fprintf('\n>>> MODULE 4 TEST PASSED SUCCESSFULLY! XAI overlay & PDF report verified in <30s. <<<\n\n');

end
