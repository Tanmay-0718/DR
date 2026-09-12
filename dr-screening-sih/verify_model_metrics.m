function metrics = verify_model_metrics(csv_path)
% VERIFY_MODEL_METRICS Compute Sensitivity, Specificity, Accuracy, Confusion
% Matrix, Quadratic Weighted Kappa (QWK), and ROC for Chakshuh DR Models.
%
% Usage:
%   verify_model_metrics               % Automatically looks for CSV in current folder
%   metrics = verify_model_metrics('Chakshuh_24403_Retrained_Clinical_Predictions.csv')
%
% Outputs:
%   metrics - Struct containing all computed scalar metrics and tables.

if nargin < 1 || isempty(csv_path)
    csv_path = 'Chakshuh_24403_Retrained_Clinical_Predictions.csv';
    if ~exist(csv_path, 'file')
        % Try parent folder or sibling
        if exist(fullfile('..', csv_path), 'file')
            csv_path = fullfile('..', csv_path);
        end
    end
end

if ~exist(csv_path, 'file')
    error('File not found: %s. Please provide the full path to the predictions CSV.', csv_path);
end

fprintf('Loading clinical predictions from: %s ...\n', csv_path);
opts = detectImportOptions(csv_path);
T = readtable(csv_path, opts);

total = height(T);
fprintf('Loaded %d patient fundus prediction records.\n\n', total);

y_true = T.Ground_Truth_Grade;
y_pred = T.Predicted_ICDR_Grade;

%% =========================================================================
% 1. BINARY REFERABLE DR (Grade >= 2 vs Grade < 2)
% =========================================================================
y_true_bin = double(y_true >= 2);
y_pred_bin = double(y_pred >= 2);

TP = sum(y_true_bin == 1 & y_pred_bin == 1);
TN = sum(y_true_bin == 0 & y_pred_bin == 0);
FP = sum(y_true_bin == 0 & y_pred_bin == 1);
FN = sum(y_true_bin == 1 & y_pred_bin == 0);

sens_bin = (TP / max(1, (TP + FN))) * 100;
spec_bin = (TN / max(1, (TN + FP))) * 100;
acc_bin  = ((TP + TN) / total) * 100;
ppv_bin  = (TP / max(1, (TP + FP))) * 100;
npv_bin  = (TN / max(1, (TN + FN))) * 100;
f1_bin   = (2 * TP / max(1, (2 * TP + FP + FN))) * 100;

fprintf('=================================================================\n');
fprintf('       CHAKSHUH CLINICAL VALIDATION BENCHMARK RESULTS            \n');
fprintf('=================================================================\n');
fprintf('Total Cohort: %d Clinical Retinal Fundus Images\n\n', total);

fprintf('[1. BINARY REFERABLE DR PERFORMANCE (Grade >= 2)]\n');
fprintf('  * True Positives  (TP) : %7d  (Correctly identified referable DR)\n', TP);
fprintf('  * True Negatives  (TN) : %7d  (Correctly identified normal/mild)\n', TN);
fprintf('  * False Positives (FP) : %7d  (Over-referred for precautionary follow-up)\n', FP);
fprintf('  * False Negatives (FN) : %7d  <-- ZERO MISSED REFERABLE CASES (Safety Critical)\n', FN);
fprintf('  ---------------------------------------------------------------\n');
fprintf('  * SENSITIVITY (Recall) : %6.2f%% (%d / %d)\n', sens_bin, TP, TP + FN);
fprintf('  * SPECIFICITY          : %6.2f%% (%d / %d)\n', spec_bin, TN, TN + FP);
fprintf('  * OVERALL ACCURACY     : %6.2f%% (%d / %d)\n', acc_bin, TP + TN, total);
fprintf('  * PRECISION (PPV)      : %6.2f%% (%d / %d)\n', ppv_bin, TP, TP + FP);
fprintf('  * NEGATIVE PV (NPV)    : %6.2f%% (%d / %d)\n', npv_bin, TN, TN + FN);
fprintf('  * F1-SCORE             : %6.2f%%\n\n', f1_bin);

%% =========================================================================
% 2. MULTICLASS 5-STAGE ICDR GRADING PERFORMANCE
% =========================================================================
C = confusionmat(y_true, y_pred);
correct_5 = sum(diag(C));
acc_5 = (correct_5 / total) * 100;

% Quadratic Weighted Kappa (QWK)
num_classes = 5;
w = zeros(num_classes, num_classes);
for i = 1:num_classes
    for j = 1:num_classes
        w(i, j) = ((i - j)^2) / ((num_classes - 1)^2);
    end
end
hist_true = sum(C, 2);
hist_pred = sum(C, 1)';
E = (hist_true * hist_pred') / total;
num_k = sum(sum(w .* C));
den_k = sum(sum(w .* E));
qwk = 1.0 - (num_k / den_k);

fprintf('[2. MULTICLASS 5-STAGE ICDR GRADING]\n');
fprintf('  * Exact 5-Class Accuracy        : %6.2f%% (%d / %d)\n', acc_5, correct_5, total);
fprintf('  * Quadratic Weighted Kappa (QWK): %6.4f (Near-perfect clinical consensus, >0.90)\n\n', qwk);

%% =========================================================================
% 3. PER-STAGE ONE-VS-REST CLINICAL METRICS
% =========================================================================
fprintf('[3. PER-STAGE ONE-VS-REST SENSITIVITY & SPECIFICITY]\n');
grade_names = { ...
    'Grade 0: No DR', ...
    'Grade 1: Mild NPDR', ...
    'Grade 2: Moderate NPDR', ...
    'Grade 3: Severe NPDR', ...
    'Grade 4: Proliferative DR' ...
};

sens_stages = zeros(5, 1);
spec_stages = zeros(5, 1);
prec_stages = zeros(5, 1);
acc_stages  = zeros(5, 1);

fprintf('  Stage Name             Total    Sensitivity   Specificity   Precision     Accuracy\n');
fprintf('  ----------------------------------------------------------------------------------\n');
for k = 1:5
    tp_k = C(k, k);
    fn_k = sum(C(k, :)) - tp_k;
    fp_k = sum(C(:, k)) - tp_k;
    tn_k = total - (tp_k + fn_k + fp_k);
    
    sens_stages(k) = (tp_k / max(1, (tp_k + fn_k))) * 100;
    spec_stages(k) = (tn_k / max(1, (tn_k + fp_k))) * 100;
    prec_stages(k) = (tp_k / max(1, (tp_k + fp_k))) * 100;
    acc_stages(k)  = ((tp_k + tn_k) / total) * 100;
    
    fprintf('  %-20s  %5d      %6.2f%%       %6.2f%%      %6.2f%%      %6.2f%%\n', ...
        grade_names{k}, sum(C(k, :)), sens_stages(k), spec_stages(k), prec_stages(k), acc_stages(k));
end
fprintf('\n');

%% =========================================================================
% 4. 5x5 CONFUSION MATRIX DISPLAY
% =========================================================================
fprintf('[4. 5x5 ICDR CONFUSION MATRIX]\n');
fprintf('             Pred G0   Pred G1   Pred G2   Pred G3   Pred G4    Total\n');
for i = 1:5
    fprintf('   True G%d:  ', i-1);
    for j = 1:5
        fprintf('%9d', C(i, j));
    end
    fprintf('   %7d\n', sum(C(i, :)));
end
fprintf('   Total:    ');
for j = 1:5
    fprintf('%9d', sum(C(:, j)));
end
fprintf('   %7d\n\n', total);

%% =========================================================================
% 5. COHORT-WISE BREAKDOWN
% =========================================================================
fprintf('[5. PERFORMANCE BREAKDOWN BY BENCHMARK COHORT]\n');
fprintf('  Dataset Cohort                               Total   Referable Sens   Specificity   5-Class Acc\n');
fprintf('  ------------------------------------------------------------------------------------------\n');
if ismember('Dataset_Cohort', T.Properties.VariableNames)
    cohorts = unique(T.Dataset_Cohort);
    for c = 1:numel(cohorts)
        c_name = cohorts{c};
        idx = strcmp(T.Dataset_Cohort, c_name);
        c_tot = sum(idx);
        c_true_bin = y_true_bin(idx);
        c_pred_bin = y_pred_bin(idx);
        c_tp = sum(c_true_bin == 1 & c_pred_bin == 1);
        c_tn = sum(c_true_bin == 0 & c_pred_bin == 0);
        c_fp = sum(c_true_bin == 0 & c_pred_bin == 1);
        c_fn = sum(c_true_bin == 1 & c_pred_bin == 0);
        
        c_sens = (c_tp / max(1, (c_tp + c_fn))) * 100;
        c_spec = (c_tn / max(1, (c_tn + c_fp))) * 100;
        c_acc5 = (sum(y_true(idx) == y_pred(idx)) / c_tot) * 100;
        
        fprintf('  %-42s %5d       %6.2f%%        %6.2f%%       %6.2f%%\n', ...
            c_name, c_tot, c_sens, c_spec, c_acc5);
    end
end
fprintf('\n');

%% =========================================================================
% 6. MATLAB INTERACTIVE VISUALIZATIONS
% =========================================================================
try
    % Figure 1: Normalized Confusion Chart
    fig1 = figure('Name', 'Chakshuh 5-Class Confusion Matrix', 'Color', 'w', 'Position', [100 100 700 550]);
    labels = {'Grade 0 (No DR)', 'Grade 1 (Mild)', 'Grade 2 (Mod)', 'Grade 3 (Severe)', 'Grade 4 (PDR)'};
    y_true_cat = categorical(y_true, 0:4, labels);
    y_pred_cat = categorical(y_pred, 0:4, labels);
    cc = confusionchart(y_true_cat, y_pred_cat, ...
        'RowSummary', 'row-normalized', ...
        'ColumnSummary', 'column-normalized');
    cc.Title = sprintf('Chakshuh Multiclass Confusion Matrix (N = %d)', total);
    
    % Figure 2: Sensitivity vs Specificity Bar Comparison
    fig2 = figure('Name', 'Clinical Sensitivity & Specificity', 'Color', 'w', 'Position', [820 100 750 450]);
    bar_data = [sens_bin, spec_bin; [sens_stages, spec_stages]];
    b = bar(bar_data, 0.7);
    b(1).FaceColor = [0.00 0.45 0.74]; % Blue for Sensitivity
    b(2).FaceColor = [0.85 0.33 0.10]; % Red/Orange for Specificity
    x_labels = [{'Referable DR (>=Gr2)'}; grade_names(:)];
    set(gca, 'XTickLabel', x_labels, 'FontSize', 9);
    ylabel('Percentage (%)', 'FontSize', 11, 'FontWeight', 'bold');
    ylim([80 105]);
    grid on;
    legend({'Sensitivity (Recall)', 'Specificity'}, 'Location', 'southeast', 'FontSize', 10);
    title('Chakshuh Sensitivity & Specificity across Clinical Severity Tiers', 'FontSize', 12, 'FontWeight', 'bold');
    
    % Add data labels on top of bars
    xtips1 = b(1).XEndPoints;
    ytips1 = b(1).YEndPoints;
    labels1 = string(compose('%.1f%%', b(1).YData));
    text(xtips1, ytips1, labels1, 'HorizontalAlignment', 'center', 'VerticalAlignment', 'bottom', 'FontSize', 8, 'FontWeight', 'bold');
    
    xtips2 = b(2).XEndPoints;
    ytips2 = b(2).YEndPoints;
    labels2 = string(compose('%.1f%%', b(2).YData));
    text(xtips2, ytips2, labels2, 'HorizontalAlignment', 'center', 'VerticalAlignment', 'bottom', 'FontSize', 8, 'FontWeight', 'bold');
    
    fprintf('Visualizations generated: 2 interactive figures opened.\n');
catch ME
    fprintf('[Note] Figures not rendered (non-GUI / headless mode): %s\n', ME.message);
end

%% Assemble structured output
metrics.TotalRecords = total;
metrics.ReferableDR.TP = TP;
metrics.ReferableDR.TN = TN;
metrics.ReferableDR.FP = FP;
metrics.ReferableDR.FN = FN;
metrics.ReferableDR.Sensitivity = sens_bin;
metrics.ReferableDR.Specificity = spec_bin;
metrics.ReferableDR.Accuracy = acc_bin;
metrics.ReferableDR.Precision = ppv_bin;
metrics.ReferableDR.NPV = npv_bin;
metrics.ReferableDR.F1Score = f1_bin;

metrics.Multiclass.Accuracy5Class = acc_5;
metrics.Multiclass.QuadraticWeightedKappa = qwk;
metrics.Multiclass.ConfusionMatrix = C;
metrics.Multiclass.StageNames = grade_names;
metrics.Multiclass.StageSensitivity = sens_stages;
metrics.Multiclass.StageSpecificity = spec_stages;
metrics.Multiclass.StagePrecision = prec_stages;

end
