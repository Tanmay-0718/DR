function [is_fundus, fundus_score, info] = verify_fundus_validity(img)
% VERIFY_FUNDUS_VALIDITY Gatekeeper Mini-Model: Verifies that an input image
% is genuinely an ocular retinal fundus photograph (rejects scenery, natural
% photos, faces, documents, pets, or out-of-distribution imagery).
%
% Inputs:
%   img          - RGB image (uint8 or double)
% Outputs:
%   is_fundus    - Logical flag (true if image is retinal fundus, false otherwise)
%   fundus_score - Confidence percentage (0..100) that image is ocular fundus
%   info         - Struct with chromatic, aperture, and cool-color diagnostic metrics

if isinteger(img)
    img = double(img) / 255.0;
end

[H, W, C] = size(img);
if C < 3
    is_fundus = false;
    fundus_score = 0;
    info.reason = 'Grayscale / single-channel image. Ocular chromatic signature missing.';
    return;
end

% 1. Extract RGB channels
r_ch = img(:,:,1);
g_ch = img(:,:,2);
b_ch = img(:,:,3);

% Compute Luminance
lum = 0.299*r_ch + 0.587*g_ch + 0.114*b_ch;
valid_mask = lum > 0.05;
non_dark_count = sum(valid_mask(:));

if non_dark_count < (0.15 * H * W)
    is_fundus = false;
    fundus_score = 5.0;
    info.reason = 'Extremely low valid pixel count (<15% illuminated).';
    return;
end

% 2. Mean Chromatic Distribution on Non-Dark Tissue
r_vals = r_ch(valid_mask);
g_vals = g_ch(valid_mask);
b_vals = b_ch(valid_mask);

mean_r = mean(r_vals);
mean_g = mean(g_vals);
mean_b = mean(b_vals);

red_ratio = (mean_r + 1e-4) / (mean_r + mean_g + mean_b + 3e-4);
blue_to_red = (mean_b + 1e-4) / (mean_r + 1e-4);

% 3. Cool Color Contamination (Sky Blue, Water, Foliage Green)
% In real fundus images, ocular melanin and hemoglobin suppress cool wavelengths.
cool_pixels = (b_ch > (r_ch + 0.06)) | ((g_ch > (r_ch + 0.10)) & (g_ch > b_ch));
cool_in_valid = cool_pixels & valid_mask;
cool_fraction = sum(cool_in_valid(:)) / non_dark_count;

% 4. Retinal Warm Pigment Fraction (RPE & Choroidal blood)
warm_pixels = (r_ch > (g_ch * 1.12)) & (r_ch > (b_ch * 1.35)) & (r_ch > 0.14);
warm_fraction = sum(warm_pixels(:) & valid_mask(:)) / non_dark_count;

% 5. Corner Vignetting (Optical Circular Aperture Check)
% Sample 4 corner regions (each 8% of image dimension)
cr_h = max(2, round(H * 0.08));
cr_w = max(2, round(W * 0.08));

corners = [
    lum(1:cr_h, 1:cr_w); ...
    lum(1:cr_h, (W-cr_w+1):W); ...
    lum((H-cr_h+1):H, 1:cr_w); ...
    lum((H-cr_h+1):H, (W-cr_w+1):W)
];
corner_mean_lum = mean(corners(:));

% 6. Multi-Parametric Probability Scoring
score = 0;
% Red dominance (RPE signature)
if red_ratio >= 0.44
    score = score + 0.35;
elseif red_ratio >= 0.38
    score = score + 0.15;
end

% Blue suppression (ocular media absorption)
if blue_to_red <= 0.50
    score = score + 0.30;
elseif blue_to_red <= 0.65
    score = score + 0.15;
end

% Cool color absence (no blue skies / green vegetation)
if cool_fraction <= 0.03
    score = score + 0.25;
elseif cool_fraction <= 0.08
    score = score + 0.10;
end

% Warm retinal pigment concentration
if warm_fraction >= 0.35
    score = score + 0.10;
end

% Corner dark vignetting bonus
if corner_mean_lum < 0.20
    score = min(1.0, score + 0.05);
end

fundus_score = round(score * 100);

% Decision Gate
% Must have sufficient composite score, low cool contamination, and red dominance
is_fundus = (score >= 0.60) && (cool_fraction < 0.08) && (blue_to_red < 0.65) && (red_ratio > 0.38);

info.red_ratio = red_ratio;
info.blue_to_red = blue_to_red;
info.cool_fraction = cool_fraction;
info.warm_fraction = warm_fraction;
info.corner_mean_lum = corner_mean_lum;
info.fundus_score = fundus_score;

if ~is_fundus
    if cool_fraction >= 0.08
        info.reason = sprintf('Cool color contamination (%.1f%% blue/green) - landscape/scenery detected.', cool_fraction*100);
    elseif blue_to_red >= 0.65
        info.reason = sprintf('High blue-to-red ratio (%.2f) - non-retinal illumination spectrum.', blue_to_red);
    elseif red_ratio <= 0.38
        info.reason = sprintf('Low red channel ratio (%.2f) - missing Retinal Pigment Epithelium (RPE) signature.', red_ratio);
    else
        info.reason = 'Composite anatomical validity score below minimum threshold (<60%).';
    end
else
    info.reason = 'Valid ocular fundus anatomical and chromatic signature confirmed.';
end

end
