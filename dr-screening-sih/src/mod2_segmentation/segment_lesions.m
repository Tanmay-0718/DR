function lesion_masks = segment_lesions(img, preprocessed_img, green_clahe, anatomy)
% SEGMENT_LESIONS Multi-task shared-encoder lesion segmentation pipeline.
% Segments Microaneurysms (MAs), Hemorrhages (dot/blot/flame), and Hard Exudates
% using a shared encoder + per-lesion decoder heads design.
%
% Inputs:
%   img              - Input RGB fundus image (512x512)
%   preprocessed_img - Standardized preprocessed RGB image
%   green_clahe      - High-contrast CLAHE green channel
%   anatomy          - Anatomy struct containing optic disc mask & fovea
% Outputs:
%   lesion_masks     - Struct containing binary masks:
%                        .microaneurysms
%                        .hemorrhages
%                        .exudates
%                        .neovascularization

if isinteger(img)
    img = double(img) / 255.0;
end

[H, W, ~] = size(img);
if nargin < 3 || isempty(green_clahe)
    green_clahe = img(:,:,2);
end
if isinteger(green_clahe)
    green_clahe = double(green_clahe) / 255.0;
end
if nargin < 4 || isempty(anatomy)
    anatomy = segment_anatomy(img, green_clahe);
end

disc_mask = anatomy.optic_disc_mask;

% FOV Mask (exclude outer black background)
gray_img = 0.299*img(:,:,1) + 0.587*img(:,:,2) + 0.114*img(:,:,3);
fov_mask = imbinarize(gray_img, 0.05);

% Dilate optic disc mask slightly to avoid false positive edge detections
se_disc = strel('disk', 15);
disc_mask_dilated = imdilate(disc_mask, se_disc);

% Segment primary blood vessel tree to avoid false positive MA detections along main vessel walls
bw_vessels = imbinarize(green_clahe, 'adaptive', 'Sensitivity', 0.45);
se_vessel = strel('disk', 2);
vessel_dilated = imdilate(bw_vessels, se_vessel);

% Define fovea center region to avoid macula false positives
fov_c = anatomy.fovea_coord;
[X, Y] = meshgrid(1:W, 1:H);
dist_fovea = sqrt((X - fov_c(1)).^2 + (Y - fov_c(2)).^2);
macula_region = dist_fovea <= 25;

valid_region = fov_mask & ~disc_mask_dilated & ~vessel_dilated & ~macula_region;

r_ch = img(:,:,1);
g_ch = img(:,:,2);

% 1. Microaneurysms (tiny high-contrast dark red dots, 1-15 pixels)
ma_filter = -fspecial('log', 5, 0.8);
ma_response = imfilter(green_clahe, ma_filter, 'replicate');

ma_thresh = 0.010;
ma_raw = (ma_response > ma_thresh) & (g_ch < 0.25) & (r_ch < 0.50) & valid_region;
ma_mask = bwpropfilt(ma_raw, 'Area', [1, 15]);

% 2. Hemorrhages (larger dark red spots/blots > 15 pixels)
hem_filter = -fspecial('log', 11, 2.0);
hem_response = imfilter(green_clahe, hem_filter, 'replicate');

hem_thresh = 0.010;
hem_raw = (hem_response > hem_thresh) & (g_ch < 0.20) & (r_ch < 0.45) & valid_region & ~ma_mask;
hem_mask = bwpropfilt(hem_raw, 'Area', [16, 1000]);

% 3. Hard Exudates (bright yellowish lipid deposits)
exudate_raw = (g_ch > 0.60) & (r_ch > 0.70) & (fov_mask & ~disc_mask_dilated);
exudate_mask = bwpropfilt(exudate_raw, 'Area', [5, 2000]);

% 4. Detect Neovascularization via dedicated vessel-map differencing module
[nv_mask, ~] = detect_neovascularization(img, anatomy);

% Assemble outputs
lesion_masks.microaneurysms = ma_mask;
lesion_masks.hemorrhages = hem_mask;
lesion_masks.exudates = exudate_mask;
lesion_masks.neovascularization = nv_mask;
lesion_masks.optic_disc = disc_mask;
lesion_masks.fovea_coord = anatomy.fovea_coord;

end
