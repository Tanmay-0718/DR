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

% 3. Hard Exudates (bright yellowish lipid deposits with sharp boundaries)
exudate_raw = (g_ch > 0.60) & (r_ch > 0.70) & (fov_mask & ~disc_mask_dilated);
exudate_mask = bwpropfilt(exudate_raw, 'Area', [5, 2000]);

% 4. Cotton Wool Spots (Soft Exudates - feathery grayish-white patches of focal nerve fiber ischemia)
% 4. Cotton Wool Spots (Soft Exudates - feathery grayish-white patches of focal nerve fiber ischemia)
cws_filter = fspecial('gaussian', 15, 3.5);
cws_smooth = imfilter(green_clahe, cws_filter, 'replicate');
cws_raw = (cws_smooth > 0.52) & (g_ch > 0.48) & (r_ch > 0.55) & (r_ch < 0.85) & ...
          valid_region & ~exudate_mask;
cws_mask = bwpropfilt(cws_raw, 'Area', [20, 1500]);

% 5. Retinal Wall Scarring (PRP Laser Photocoagulation Scars & Fibrovascular Membranes)
% PRP scars are regular circular punched-out atrophic spots with pigmented halos in mid-periphery.
% Fibrovascular scars are hyper-reflective fibrotic traction bands along retinal vessels.
fov_eroded = imerode(fov_mask, strel('disk', 35));
peripheral_zone = fov_eroded & ~disc_mask_dilated & ~vessel_dilated & (dist_fovea > 60);

% Circular atrophic laser scars (high local contrast with sharp dark ring or bright core)
scar_lap = fspecial('log', 9, 1.2);
scar_resp = imfilter(gray_img, scar_lap, 'replicate');
laser_scars_raw = (abs(scar_resp) > 0.035) & (gray_img < 0.20 | (gray_img > 0.75 & ~exudate_mask)) & peripheral_zone & ~exudate_mask;
laser_scars = bwpropfilt(laser_scars_raw, 'Area', [15, 200]);

% Melanin Pigment Halo Analysis:
% Dilate laser scar cores by 3px and subtract core to sample the annular margin.
% A true photocoagulation burn exhibits an atrophic core surrounded by a darker melanin halo.
se_halo = strel('disk', 3);
scar_dilated = imdilate(laser_scars, se_halo);
annular_halo = scar_dilated & ~laser_scars & fov_mask;
halo_pigmented = annular_halo & (gray_img < 0.32 | g_ch < 0.28);

% Fibrous proliferation scars (fibrotic whitening along vessel arcades)
% Requires high local contrast above local background and proximity to vessel branches
local_bg = imfilter(gray_img, fspecial('average', 31), 'replicate');
local_contrast = gray_img - local_bg;
vessel_proximity = imdilate(bw_vessels, strel('disk', 12));

fibrous_raw = (local_contrast > 0.12) & (green_clahe > 0.78) & (r_ch > 0.80) & ...
              peripheral_zone & vessel_proximity & ~exudate_mask;
fibrous_scars = bwpropfilt(fibrous_raw, 'Area', [40, 1500]);

retinal_scars_mask = laser_scars | fibrous_scars;

% 6. Intraretinal Microvascular Abnormalities (IRMA) & Venous Calibre Shunts
% Tortuous, dilated capillary shunt vessels bypassing non-perfused capillary zones
irma_filter = -fspecial('log', 7, 1.0);
irma_resp = imfilter(green_clahe, irma_filter, 'replicate');
irma_raw = (irma_resp > 0.012) & (g_ch < 0.28) & valid_region & ~ma_mask & ~hem_mask & ~exudate_mask;
irma_mask = bwpropfilt(irma_raw, 'Area', [8, 80]);

% 7. Detect Neovascularization via dedicated vessel-map differencing module
[nv_mask, ~] = detect_neovascularization(img, anatomy);

% 8. Venous Beading (VB) Detection (ETDRS Rule "2")
% Retinal veins are larger, darker vessels showing localized constriction & dilation (beading)
% Extract major venous trunks (vessel caliber > 3px)
se_open = strel('disk', 2);
vein_candidates = imopen(bw_vessels, se_open) & fov_mask & ~disc_mask_dilated;
vein_cc = bwconncomp(vein_candidates);
vein_stats = regionprops(vein_cc, 'Area', 'PixelIdxList', 'MajorAxisLength', 'MinorAxisLength');

vb_mask = false(H, W);
if vein_cc.NumObjects > 0
    % Distance transform inside vessels gives local radius at every point
    dist_map = bwdist(~vein_candidates);
    
    for v_idx = 1:vein_cc.NumObjects
        if vein_stats(v_idx).Area >= 35 && vein_stats(v_idx).MajorAxisLength >= 25
            pix = vein_stats(v_idx).PixelIdxList;
            rads = dist_map(pix);
            mean_r = mean(rads);
            std_r = std(rads);
            
            % Coefficient of variation (CV) along vessel segment:
            % Normal vessels have smooth tapering (CV < 0.22).
            % Beaded veins exhibit sausage-like caliber oscillations (CV > 0.28).
            if mean_r >= 1.5 && (std_r / max(0.1, mean_r)) > 0.28
                v_clahe = green_clahe(pix);
                if mean(v_clahe) < 0.42 % Venous darkness constraint
                    vb_mask(pix) = true;
                end
            end
        end
    end
end

% 9. Four-Quadrant Partitioning for ETDRS 4-2-1 Rule (ST, SN, IT, IN)
fc_x = fov_c(1); fc_y = fov_c(2);
is_od_right = (anatomy.disc_center(1) > fc_x);

if is_od_right
    % Right eye / OD to right of fovea
    q_st = (X < fc_x) & (Y < fc_y) & fov_mask;
    q_sn = (X >= fc_x) & (Y < fc_y) & fov_mask;
    q_it = (X < fc_x) & (Y >= fc_y) & fov_mask;
    q_in = (X >= fc_x) & (Y >= fc_y) & fov_mask;
else
    % Left eye / OD to left of fovea
    q_sn = (X < fc_x) & (Y < fc_y) & fov_mask;
    q_st = (X >= fc_x) & (Y < fc_y) & fov_mask;
    q_in = (X < fc_x) & (Y >= fc_y) & fov_mask;
    q_it = (X >= fc_x) & (Y >= fc_y) & fov_mask;
end

quadrants.st = q_st;
quadrants.sn = q_sn;
quadrants.it = q_it;
quadrants.in = q_in;

% Assemble outputs
lesion_masks.microaneurysms = ma_mask;
lesion_masks.hemorrhages = hem_mask;
lesion_masks.exudates = exudate_mask;
lesion_masks.cotton_wool_spots = cws_mask;
lesion_masks.retinal_scarring = retinal_scars_mask;
lesion_masks.laser_scars = laser_scars;
lesion_masks.pigment_halo_mask = halo_pigmented;
lesion_masks.fibrous_scars = fibrous_scars;
lesion_masks.irma = irma_mask;
lesion_masks.venous_beading = vb_mask;
lesion_masks.neovascularization = nv_mask;
lesion_masks.optic_disc = disc_mask;
lesion_masks.fovea_coord = anatomy.fovea_coord;
lesion_masks.quadrants = quadrants;

end
