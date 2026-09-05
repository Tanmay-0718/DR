function [grade, referable_dr, confidence, probs] = predict_icdr_grade(img, feature_vector, model)
% PREDICT_ICDR_GRADE Predicts ICDR Severity Grade (0-4) using feature fusion.
% Fuses CNN feature vector with Module 2 hand-crafted lesion metrics.
%
% Inputs:
%   img            - Input/Preprocessed fundus image
%   feature_vector - Hand-crafted lesion feature vector (1x6)
%   model          - Fused feature model struct (from build_fused_model)
% Outputs:
%   grade          - Predicted ICDR grade integer (0: No DR, 1: Mild, 2: Mod, 3: Sev, 4: PDR)
%   referable_dr   - Boolean (true if referable DR: Grade >= 2)
%   confidence     - Softmax confidence score (0-100%)
%   probs          - 1x5 vector of class probabilities

if nargin < 3 || isempty(model)
    model = build_fused_model('efficientnetb0');
end
if isinteger(img)
    img = double(img) / 255.0;
end

% 1. Extract CNN Global Feature Vector (Synthetic/ResNet feature proxy)
g_ch = img(:,:,2);
r_ch = img(:,:,1);
b_ch = img(:,:,3);

% Compute spatial feature pool
r_mean = mean(r_ch(:)); r_std = std(r_ch(:));
g_mean = mean(g_ch(:)); g_std = std(g_ch(:));
b_mean = mean(b_ch(:)); b_std = std(b_ch(:));

cnn_proxy = repmat([r_mean, r_std, g_mean, g_std, b_mean, b_std], 1, 22);
cnn_proxy = cnn_proxy(1:model.cnn_feature_dim); % 1x128

% 2. Normalize hand-crafted feature vector (support 6-dim, 10-dim, or 14-dim)
if length(feature_vector) < model.num_handcrafted_features
    padded_feat = zeros(1, model.num_handcrafted_features);
    padded_feat(1:length(feature_vector)) = feature_vector;
    feature_vector = padded_feat;
elseif length(feature_vector) > model.num_handcrafted_features
    feature_vector = feature_vector(1:model.num_handcrafted_features);
end

feat_norm = feature_vector;
feat_norm(1) = min(feature_vector(1) / 50.0, 5.0);      % MA count scaling
feat_norm(2) = min(feature_vector(2) / 100.0, 5.0);     % Hemorrhage count scaling
feat_norm(3) = min(feature_vector(3) / 10.0, 5.0);      % Exudate area % scaling
feat_norm(4) = min(feature_vector(4) / 500.0, 1.0);     % Disc distance scaling
feat_norm(5) = feature_vector(5);                       % NV flag
feat_norm(6) = min(feature_vector(6) / 500.0, 1.0);     % DME dist scaling
feat_norm(7) = min(feature_vector(7) / 20.0, 5.0);      % Cotton Wool Spots scaling
feat_norm(8) = feature_vector(8);                       % Retinal Wall Scarring flag
feat_norm(9) = feature_vector(9);                       % IRMA flag
feat_norm(10) = min(feature_vector(10) / 30.0, 5.0);    % Scar count scaling
if length(feature_vector) >= 14
    feat_norm(11) = feature_vector(11);                 % PRP pattern score [0..1]
    feat_norm(12) = feature_vector(12);                 % Pigment halo ratio [0..1]
    feat_norm(13) = min(feature_vector(13) / 4.0, 1.0); % Quadrant hem density [0..4]
    feat_norm(14) = feature_vector(14);                 % Fibrotic traction score [0..1]
end
if length(feature_vector) >= 18
    feat_norm(15) = min(feature_vector(15) / 4.0, 1.0); % VB quad count [0..4]
    feat_norm(16) = min(feature_vector(16) / 3.0, 1.0); % ETDRS 421 score [0..3]
    feat_norm(17) = min(feature_vector(17) / 4.0, 1.0); % IRMA quad count [0..4]
    feat_norm(18) = feature_vector(18);                 % Very Severe flag [0,1]
end

% 3. Concatenate (Feature Fusion)
fused_vector = [cnn_proxy, feat_norm]; % 1x146

% 4. Feedthrough Fused FC Layers
h1 = max(0, fused_vector * model.W1 + model.b1); % ReLU activation
logits = h1 * model.W2 + model.b2;

% Clinical Tri-Stage Differentiation Logic: Grade 2 vs Grade 3 vs Grade 4
% Feature Indices:
%   f(1): MA, f(2): Hem, f(3): Exudate, f(5): NV, f(7): CWS, f(8): Scar Flag,
%   f(9): IRMA, f(10): Scar Count, f(11): Pattern Score, f(12): Halo Ratio,
%   f(13): 4Q Bleeds, f(14): Fibrotic Traction, f(15): VB 2Q Count,
%   f(16): ETDRS 4-2-1 Score (0..3), f(17): IRMA 1Q Count, f(18): Very Severe NPDR

% STEP 1: Evaluate Grade 4 (PDR / Treated PDR)
is_grade_4 = (feature_vector(5) > 0) || ... % Active Neovascularization
             (feature_vector(8) > 0 && feature_vector(10) >= 15) || ... % True PRP Laser Scars (>=15 burns)
             (length(feature_vector) >= 14 && feature_vector(14) > 0.60); % Dense Fibrotic Traction

% STEP 2: Evaluate Grade 3 (Severe NPDR - Strict ETDRS 4-2-1 Rule)
% Rule "4": Severe 4-quadrant intraretinal hemorrhages (f13 >= 3 or f2 >= 30)
% Rule "2": Venous beading in >= 2 quadrants (f15 >= 2)
% Rule "1": Prominent IRMA in >= 1 quadrant (f9 > 0 or f17 >= 1)
has_etdrs_421 = false;
is_very_severe = false;

if length(feature_vector) >= 16
    has_etdrs_421 = (feature_vector(16) >= 1);
    is_very_severe = (feature_vector(16) >= 2);
else
    has_etdrs_421 = (feature_vector(9) > 0) || ...
                    (length(feature_vector) >= 13 && feature_vector(13) >= 3) || ...
                    (feature_vector(2) >= 30);
end

is_grade_3 = ~is_grade_4 && (has_etdrs_421 || feature_vector(2) >= 30 || feature_vector(9) > 0);

% STEP 3: Evaluate Grade 2 (Moderate NPDR)
% Must NOT meet 4-2-1 rule, but has CWS, exudates, or focal hemorrhages
is_grade_2 = ~is_grade_4 && ~is_grade_3 && ( ...
             (feature_vector(7) > 0) || ... % Cotton Wool Spots (focal nerve fiber ischemia)
             (feature_vector(3) >= 0.20) || ... % Hard Exudate deposits
             (feature_vector(2) >= 3) || ... % Light/moderate hemorrhages
             (feature_vector(1) >= 5)); % Multiple microaneurysms

if is_grade_4
    logits(5) = logits(5) + 3.8;
elseif is_grade_3
    if is_very_severe
        logits(4) = logits(4) + 4.2; % Very Severe NPDR: high pre-proliferative risk
    else
        logits(4) = logits(4) + 3.2; % Standard Severe NPDR: 4-2-1 met
    end
elseif is_grade_2
    logits(3) = logits(3) + 2.5;
elseif feature_vector(1) >= 1 || feature_vector(3) > 0
    % Grade 1 (Mild NPDR): MAs only without CWS or laser scars
    logits(2) = logits(2) + 1.8;
else
    % Grade 0 (No DR)
    logits(1) = logits(1) + 3.5;
end

% Softmax calculation
exp_logits = exp(logits - max(logits));
probs = exp_logits / sum(exp_logits);

% Determine predicted class (0-indexed grade: 0..4)
[max_prob, idx] = max(probs);
grade = idx - 1;

% Referable DR Determination:
% Grade 0 is non-referable; Grade >= 2 is referable; Grade 1 depends on risk threshold
prob_referable = sum(probs(3:5));
if grade == 0
    referable_dr = false;
elseif grade >= 2
    referable_dr = true;
else
    referable_dr = prob_referable >= model.referable_threshold;
end

confidence = max_prob * 100.0;

end
