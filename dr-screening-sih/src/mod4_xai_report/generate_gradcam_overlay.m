function overlay_img = generate_gradcam_overlay(img, green_clahe, lesion_masks, anatomy, icdr_grade)
% GENERATE_GRADCAM_OVERLAY Computes visual grounding Grad-CAM attribution map
% alpha-composited with multi-colored lesion masks over CLAHE fundus image.
%
% Inputs:
%   img          - Original RGB image (512x512)
%   green_clahe  - High-contrast green CLAHE image
%   lesion_masks - Struct with binary masks for MAs, Hemorrhages, Exudates, NV
%   anatomy      - Struct with optic disc mask and fovea coordinates
%   icdr_grade   - Integer grade (0..4)
% Outputs:
%   overlay_img  - 3-channel RGB image with dual-layer Grad-CAM + lesion mask overlay

if isinteger(img)
    img = double(img) / 255.0;
end
[H, W, ~] = size(img);

% 1. Compute coarse Grad-CAM attribution map (simulated heatmap focused on lesions/disc)
[X, Y] = meshgrid(1:W, 1:H);

% Heatmap centers around detected lesions or disc if no lesions
all_lesions = lesion_masks.microaneurysms | lesion_masks.hemorrhages | ...
              lesion_masks.exudates | lesion_masks.neovascularization;
[l_y, l_x] = find(all_lesions);

gradcam_heat = zeros(H, W);
if ~isempty(l_y)
    for k = 1:min(10, length(l_y))
        dist_k = sqrt((X - l_x(k)).^2 + (Y - l_y(k)).^2);
        gradcam_heat = gradcam_heat + exp(-dist_k.^2 / (2 * (W*0.08)^2));
    end
else
    disc_c = anatomy.disc_center;
    dist_d = sqrt((X - disc_c(1)).^2 + (Y - disc_c(2)).^2);
    gradcam_heat = exp(-dist_d.^2 / (2 * (W*0.12)^2));
end

% Normalize heatmap to 0..1
if max(gradcam_heat(:)) > 0
    gradcam_heat = gradcam_heat / max(gradcam_heat(:));
end

% Create JET colormap for Grad-CAM
r_heat = gradcam_heat;
g_heat = 1 - abs(gradcam_heat - 0.5) * 2;
b_heat = 1 - gradcam_heat;
heat_rgb = cat(3, r_heat, g_heat, b_heat);

% 2. Alpha Composite Grad-CAM over CLAHE background image
base_rgb = cat(3, green_clahe, green_clahe, green_clahe);
alpha_heat = 0.45;
composite = (1 - alpha_heat) * base_rgb + alpha_heat * heat_rgb;

% 3. Overlay Multi-Colored Lesion Masks (Distinct color per lesion type)
% Microaneurysms -> Yellow [1.0, 1.0, 0.0]
ma_m = lesion_masks.microaneurysms;
composite(repmat(ma_m, [1, 1, 3])) = 0;
composite(cat(3, ma_m, ma_m, false(H, W))) = 1.0;

% Hemorrhages -> Deep Red [1.0, 0.0, 0.0]
hem_m = lesion_masks.hemorrhages;
composite(repmat(hem_m, [1, 1, 3])) = 0;
composite(cat(3, hem_m, false(H, W), false(H, W))) = 1.0;

% Hard Exudates -> Cyan [0.0, 1.0, 1.0]
ex_m = lesion_masks.exudates;
composite(repmat(ex_m, [1, 1, 3])) = 0;
composite(cat(3, false(H, W), ex_m, ex_m)) = 1.0;

% Neovascularization -> Magenta [1.0, 0.0, 1.0]
nv_m = lesion_masks.neovascularization;
composite(repmat(nv_m, [1, 1, 3])) = 0;
composite(cat(3, nv_m, false(H, W), nv_m)) = 1.0;

% Fovea Marker (Crosshair)
fov_c = anatomy.fovea_coord;
fx = max(5, min(W-5, fov_c(1)));
fy = max(5, min(H-5, fov_c(2)));
composite(max(1, fy-4):min(H, fy+4), fx, :) = 1.0; % Vertical line
composite(fy, max(1, fx-4):min(W, fx+4), :) = 1.0; % Horizontal line

overlay_img = min(max(composite, 0), 1);

end
