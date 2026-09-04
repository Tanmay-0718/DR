function test_mod3()
% TEST_MOD3 Standalone verification script for Module 3 (ICDR Severity Grading).
% Verifies fused feature model inference, ROC curve metrics, and Sens > 90% / Spec > 85% operating point.

fprintf('========================================================\n');
fprintf('RUNNING MODULE 3 STANDALONE TEST: ICDR SEVERITY GRADING\n');
fprintf('========================================================\n');

% 1. Test Model Construction (Primary & Fallback)
model_eff = build_fused_model('efficientnetb0');
model_res = build_fused_model('resnet50');
assert(strcmp(model_eff.backbone_name, 'efficientnetb0'), 'Primary backbone mismatch!');
assert(strcmp(model_res.backbone_name, 'resnet50'), 'Fallback backbone mismatch!');

% 2. Test Feature-Fused Prediction
dummy_img = rand(512, 512, 3);
% Test Grade 0 sample (no lesions)
feat_g0 = [0, 0, 0, 500, 0, 500];
[grade_0, ref_0, conf_0, probs_0] = predict_icdr_grade(dummy_img, feat_g0, model_eff);

% Test Grade 4 PDR sample (NV + high lesions)
feat_g4 = [25, 45, 5.2, 35.0, 1, 45.0];
[grade_4, ref_4, conf_4, probs_4] = predict_icdr_grade(dummy_img, feat_g4, model_eff);

fprintf('[Inference Verification]\n');
fprintf('  Grade 0 Sample -> Predicted Grade: %d (Referable: %s, Confidence: %.1f%%)\n', ...
    grade_0, char(string(ref_0)), conf_0);
fprintf('  Grade 4 Sample -> Predicted Grade: %d (Referable: %s, Confidence: %.1f%%)\n', ...
    grade_4, char(string(ref_4)), conf_4);

assert(ref_0 == false, 'Grade 0 sample should NOT be referable!');
assert(ref_4 == true, 'Grade 4 PDR sample MUST be referable!');

% 3. Test K-Fold Cross-Validation and Benchmark Target
results = train_eval_grading('', 5);

assert(results.sensitivity >= 0.90, 'Sensitivity target (>90%) missed!');
assert(results.specificity >= 0.85, 'Specificity target (>85%) missed!');

fprintf('\n>>> MODULE 3 TEST PASSED SUCCESSFULLY! Fused model & Sens/Spec targets verified. <<<\n\n');

end
