function metrics = compute_iqa_metrics(img)
% COMPUTE_IQA_METRICS Computes per-image quality metrics for gradability assessment:
%   1. Laplacian-variance sharpness
%   2. Mean & Std illumination (LAB L-channel)
%   3. Circular Hough fit FOV coverage ratio
%   4. Green-channel vessel-density proxy
%
% Input:
%   img - Input RGB fundus image (uint8 or double, values 0..255 or 0..1)
% Output:
%   metrics - Struct containing quantitative IQA metric values

if isinteger(img)
    img = double(img) / 255.0;
end

[H, W, ~] = size(img);
green_ch = img(:, :, 2);

% 1. Sharpness via Laplacian Variance
lap_filter = fspecial('laplacian', 0.2);
lap_map = imfilter(green_ch, lap_filter, 'replicate');
metrics.sharpness_variance = var(lap_map(:));

% 2. Illumination metrics via LAB L-channel
% Convert RGB to LAB (manual or via rgb2lab)
try
    lab_img = rgb2lab(img);
    L_ch = lab_img(:, :, 1);
catch
    % Fallback luminance calculation if rgb2lab is missing
    L_ch = (0.299 * img(:,:,1) + 0.587 * img(:,:,2) + 0.114 * img(:,:,3)) * 100;
end
metrics.illumination_mean = mean(L_ch(:));
metrics.illumination_std = std(L_ch(:));

% 3. FOV Coverage Ratio (Circular Hough fit / binarization)
gray_img = 0.299 * img(:,:,1) + 0.587 * img(:,:,2) + 0.114 * img(:,:,3);
fov_mask = gray_img > 0.05;
fov_pixel_count = sum(fov_mask(:));
total_pixels = H * W;
metrics.fov_coverage = fov_pixel_count / total_pixels;

% 4. Vessel Density Proxy (adaptive binarization on green channel)
bw_vessels = imbinarize(green_ch, 'adaptive', 'Sensitivity', 0.4);
% Exclude outer background
bw_vessels(~fov_mask) = 0;
metrics.vessel_density = sum(bw_vessels(:)) / max(1, fov_pixel_count);

end
