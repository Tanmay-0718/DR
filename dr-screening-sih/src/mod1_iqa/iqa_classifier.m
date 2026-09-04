function [is_gradable, reason_code, metrics, elapsed_ms] = iqa_classifier(img)
% IQA_CLASSIFIER Evaluates fundus image quality and returns gradability status.
% Hard constraint: Must execute in < 200ms at the edge.
%
% Inputs:
%   img         - Input RGB image
% Outputs:
%   is_gradable - Boolean (true if image is gradable, false otherwise)
%   reason_code - Structured string: 'pass', 'blur', 'illumination', 'fov_cutoff'
%   metrics     - Quantitative IQA metrics struct
%   elapsed_ms  - Processing latency in milliseconds

t_start = tic;

% Calculate quality metrics
metrics = compute_iqa_metrics(img);

% Define empirical decision thresholds for edge gate
SHARPNESS_THRESHOLD = 0.00015; % Below this is blurry
ILLUM_MIN = 8.0;              % Below this is dark/underexposed
ILLUM_MAX = 92.0;             % Above this is overexposed/washed out
FOV_MIN_RATIO = 0.35;         % Below this is truncated FOV

is_gradable = true;
reason_code = 'pass';

if metrics.sharpness_variance < SHARPNESS_THRESHOLD
    is_gradable = false;
    reason_code = 'blur';
elseif metrics.illumination_mean < ILLUM_MIN || metrics.illumination_mean > ILLUM_MAX
    is_gradable = false;
    reason_code = 'illumination';
elseif metrics.fov_coverage < FOV_MIN_RATIO
    is_gradable = false;
    reason_code = 'fov_cutoff';
end

elapsed_ms = toc(t_start) * 1000;

end
