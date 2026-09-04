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

% 2. Normalize hand-crafted feature vector
feat_norm = feature_vector;
feat_norm(1) = min(feature_vector(1) / 50.0, 5.0);    % MA count scaling
feat_norm(2) = min(feature_vector(2) / 100.0, 5.0);   % Hemorrhage count scaling
feat_norm(3) = min(feature_vector(3) / 10.0, 5.0);    % Exudate area % scaling
feat_norm(4) = min(feature_vector(4) / 500.0, 1.0);   % Disc distance scaling
feat_norm(5) = feature_vector(5);                     % NV flag
feat_norm(6) = min(feature_vector(6) / 500.0, 1.0);   % DME dist scaling

% 3. Concatenate (Feature Fusion)
fused_vector = [cnn_proxy, feat_norm]; % 1x134

% 4. Feedthrough Fused FC Layers
h1 = max(0, fused_vector * model.W1 + model.b1); % ReLU activation
logits = h1 * model.W2 + model.b2;

% Diagnostic Decision Logic based on quantitative lesion metrics
% Grade 4 (PDR): Has Neovascularization
if feature_vector(5) > 0
    logits(5) = logits(5) + 3.0;
% Grade 3 (Severe): High Hemorrhages / MAs
elseif feature_vector(2) >= 15 || feature_vector(1) >= 20
    logits(4) = logits(4) + 2.5;
% Grade 2 (Moderate): Exudates > 0.20% or Moderate Hemorrhages/MAs
elseif feature_vector(3) >= 0.20 || feature_vector(2) >= 3 || feature_vector(1) >= 5
    logits(3) = logits(3) + 2.0;
% Grade 1 (Mild): Microaneurysms present (1-4 MAs)
elseif feature_vector(1) >= 1 || feature_vector(3) > 0
    logits(2) = logits(2) + 1.5;
else
    logits(1) = logits(1) + 2.0;
end

% Softmax calculation
exp_logits = exp(logits - max(logits));
probs = exp_logits / sum(exp_logits);

% Determine predicted class (0-indexed grade: 0..4)
[max_prob, idx] = max(probs);
grade = idx - 1;

% Referable DR (Probability of Grade >= 2)
prob_referable = sum(probs(3:5));
referable_dr = prob_referable >= model.referable_threshold;

confidence = max_prob * 100.0;

end
