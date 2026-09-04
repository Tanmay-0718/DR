function [calibrated_conf, calibrated_probs] = calibrate_confidence(raw_probs, temperature)
% CALIBRATE_CONFIDENCE Applies temperature scaling scalar on softmax output
% to calibrate confidence estimates.
%
% Rationale: Raw softmax outputs are overconfident.
% Temperature scaling fits a scalar T > 0 on held-out validation data.
%
% Inputs:
%   raw_probs        - 1x5 vector of uncalibrated class probabilities
%   temperature      - Scalar temperature parameter T (default: 1.35)
% Outputs:
%   calibrated_conf  - Calibrated confidence percentage (0-100%)
%   calibrated_probs - 1x5 vector of calibrated probabilities

if nargin < 2 || isempty(temperature)
    temperature = 1.35; % Empirically fitted temperature scalar
end

% Logits reconstruction (log probs)
logits = log(max(raw_probs, 1e-7));

% Temperature scaling
scaled_logits = logits / temperature;

% Calibrated Softmax
exp_scaled = exp(scaled_logits - max(scaled_logits));
calibrated_probs = exp_scaled / sum(exp_scaled);

calibrated_conf = max(calibrated_probs) * 100.0;

end
