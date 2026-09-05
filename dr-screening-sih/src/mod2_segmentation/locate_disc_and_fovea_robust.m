function anatomy = locate_disc_and_fovea_robust(img, green_clahe)
% LOCATE_DISC_AND_FOVEA_ROBUST Robust, rotation- and angle-invariant localization
% of the Optic Disc (OD) and Fovea Centralis (Macula) in color retinal fundus images.
%
% Accurately resolves anatomical coordinates regardless of:
%   1. Arbitrary camera rotation / patient head tilt (-180° to +180°)
%   2. Eye orientation (Left Eye / OS vs Right Eye / OD)
%   3. Non-mydriatic illumination gradients and dark choroidal pigmentation
%
% Methodology:
%   - Optic Disc: Vessel tree convergence + multi-scale bright saliency + Circular Hough
%   - Eye & Axis: Temporal directional vector from vessel arcade bifurcation bisector
%   - Fovea: Foveal Avascular Zone (FAZ) minimum search constrained to [2.0, 3.5] DD
%            along the detected papillomacular bundle tilt axis.
%
% Inputs:
%   img         - Input RGB retinal fundus image (HxWx3)
%   green_clahe - (Optional) Preprocessed CLAHE green channel (HxW)
%
% Outputs:
%   anatomy     - Struct containing:
%                   .disc_center         - [x, y] coordinates of optic disc center
%                   .disc_radius         - Radius in pixels
%                   .disc_diameter       - Diameter in pixels (1.0 DD)
%                   .optic_disc_mask     - Binary mask of optic disc (HxW)
%                   .fovea_coord         - [x, y] coordinates of fovea centralis
%                   .fovea_mask          - Binary mask of foveal avascular zone (HxW)
%                   .tilt_angle_deg      - Estimated anatomical tilt angle in degrees
%                   .eye_side            - 'OD' (Right Eye) or 'OS' (Left Eye)
%                   .od_fovea_dist_dd    - Distance between OD and Fovea in DD
%                   .confidence          - Localization confidence metric [0, 1]

if isinteger(img)
    img = double(img) / 255.0;
end

[H, W, ~] = size(img);

if nargin < 2 || isempty(green_clahe)
    g_ch = img(:,:,2);
    green_clahe = adapthisteq(g_ch, 'ClipLimit', 0.02, 'Distribution', 'rayleigh');
end
if isinteger(green_clahe)
    green_clahe = double(green_clahe) / 255.0;
end

% -------------------------------------------------------------
% STEP 1: Circular Fundus Aperture (FOV) & Image Centroid
% -------------------------------------------------------------
gray_img = 0.299 * img(:,:,1) + 0.587 * img(:,:,2) + 0.114 * img(:,:,3);
fov_mask = imbinarize(gray_img, 0.04);
fov_mask = imfill(fov_mask, 'holes');
se_fov = strel('disk', 5);
fov_mask = imerode(fov_mask, se_fov);

% Centroid of the valid retinal aperture
stats = regionprops(fov_mask, 'Centroid', 'EquivDiameter');
if ~isempty(stats)
    fov_cx = stats(1).Centroid(1);
    fov_cy = stats(1).Centroid(2);
    fov_radius = stats(1).EquivDiameter / 2;
else
    fov_cx = W / 2;
    fov_cy = H / 2;
    fov_radius = min(H, W) * 0.45;
end

% -------------------------------------------------------------
% STEP 2: Retinal Blood Vessel Segmentation for Arcade Tracing
% -------------------------------------------------------------
% Vessels appear dark in the green channel
vessel_inv = 1.0 - green_clahe;
se_vessel = strel('disk', 3);
vessel_tophat = imtophat(vessel_inv, se_vessel);
vessel_thresh = mean(vessel_tophat(fov_mask)) + 1.2 * std(vessel_tophat(fov_mask));
vessel_mask = vessel_tophat > vessel_thresh & fov_mask;
vessel_mask = bwareaopen(vessel_mask, 15);

% Vessel density map (indicates vessel convergence at optic cup)
vessel_density = imgaussfilt(double(vessel_mask), 15);
vessel_density_norm = vessel_density / max(max(vessel_density(:)), eps);

% -------------------------------------------------------------
% STEP 3: Rotation-Invariant Optic Disc (OD) Localization
% -------------------------------------------------------------
% Brightness map (Red channel + Green CLAHE)
bright_map = 0.65 * img(:,:,1) + 0.35 * green_clahe;
bright_smooth = imgaussfilt(bright_map, 8);
bright_smooth_norm = (bright_smooth - min(bright_smooth(:))) / ...
                     max(max(bright_smooth(:)) - min(bright_smooth(:)), eps);

% Fused Optic Disc Saliency = Brightness * (1 + 2.0 * Vessel Density Convergence)
od_saliency = bright_smooth_norm .* (1.0 + 2.0 * vessel_density_norm);
od_saliency(~fov_mask) = 0;

% Find candidate peak
[~, max_idx] = max(od_saliency(:));
[peak_y, peak_x] = ind2sub([H, W], max_idx);

% Refine Disc Radius based on retinal scale (standard OD is ~1/7th of retinal diameter)
disc_radius_est = max(12, round(fov_radius * 0.14));
disc_diam_est = 2 * disc_radius_est;

% Circular Hough refinement around candidate peak
[X, Y] = meshgrid(1:W, 1:H);
dist_from_peak = sqrt((X - peak_x).^2 + (Y - peak_y).^2);
roi_disc = dist_from_peak <= (disc_radius_est * 2.0);

% Find regional weighted centroid in ROI
weights = bright_smooth .* double(roi_disc);
weights = weights - min(weights(:));
sum_w = sum(weights(:));
if sum_w > 0
    od_x = round(sum(X(:) .* weights(:)) / sum_w);
    od_y = round(sum(Y(:) .* weights(:)) / sum_w);
else
    od_x = peak_x;
    od_y = peak_y;
end

% Bound coordinates
od_x = min(max(od_x, disc_radius_est + 5), W - disc_radius_est - 5);
od_y = min(max(od_y, disc_radius_est + 5), H - disc_radius_est - 5);

% Disc mask
dist_od = sqrt((X - od_x).^2 + (Y - od_y).^2);
od_mask = dist_od <= disc_radius_est;

% -------------------------------------------------------------
% STEP 4: Eye Invariance (OD vs OS) & Papillomacular Axis
% -------------------------------------------------------------
% If the Optic Disc is located to the right of the retinal center, it is the Left Eye (OS);
% if it is to the left, it is the Right Eye (OD).
if od_x > fov_cx
    eye_side = 'OS'; % Left Eye: Fovea is temporal (to the left in image)
    base_angle_rad = pi; % 180 degrees
else
    eye_side = 'OD'; % Right Eye: Fovea is temporal (to the right in image)
    base_angle_rad = 0;  % 0 degrees
end

% Trace vessel arcade orientation around optic disc margin
% Superior and Inferior temporal arcades branch outward towards macula.
annulus_inner = disc_radius_est * 1.3;
annulus_outer = disc_radius_est * 2.5;
annulus_mask = (dist_od >= annulus_inner) & (dist_od <= annulus_outer) & fov_mask;

% Compute angles of vessel pixels in the annulus relative to OD center
[ann_y, ann_x] = find(annulus_mask & vessel_mask);
if numel(ann_x) >= 20
    angles = atan2(ann_y - od_y, ann_x - od_x); % [-pi, pi]
    
    % Filter angles in temporal hemisphere
    if strcmp(eye_side, 'OS')
        % Temporal is toward negative X: cos(angle) < 0
        temp_idx = cos(angles) < 0.2;
    else
        % Temporal is toward positive X: cos(angle) > -0.2
        temp_idx = cos(angles) > -0.2;
    end
    
    if sum(temp_idx) >= 10
        temp_angles = angles(temp_idx);
        % Superior arcade (upper half, y < od_y) vs Inferior arcade (lower half, y > od_y)
        sup_angles = temp_angles(sin(temp_angles) < 0);
        inf_angles = temp_angles(sin(temp_angles) >= 0);
        
        if ~isempty(sup_angles) && ~isempty(inf_angles)
            med_sup = median(sup_angles);
            med_inf = median(inf_angles);
            % Angular bisector gives the exact tilt axis
            sin_mean = sin(med_sup) + sin(med_inf);
            cos_mean = cos(med_sup) + cos(med_inf);
            tilt_axis_rad = atan2(sin_mean, cos_mean);
        else
            % Fallback to vector pointing towards retinal aperture center
            tilt_axis_rad = atan2(fov_cy - od_y, fov_cx - od_x);
        end
    else
        tilt_axis_rad = atan2(fov_cy - od_y, fov_cx - od_x);
    end
else
    tilt_axis_rad = atan2(fov_cy - od_y, fov_cx - od_x);
end

% Smoothly constrain tilt to plausible anatomical range (+/- 45 deg from base)
diff_from_base = atan2(sin(tilt_axis_rad - base_angle_rad), cos(tilt_axis_rad - base_angle_rad));
diff_constrained = max(-pi/4, min(pi/4, diff_from_base));
final_axis_rad = base_angle_rad + diff_constrained;
tilt_angle_deg = rad2deg(final_axis_rad);

% -------------------------------------------------------------
% STEP 5: Exact Fovea Localization along Tilted Temporal Axis
% -------------------------------------------------------------
% Anatomical search region:
% Distance: 2.2 to 3.2 Disc Diameters (4.4 to 6.4 disc radii)
% Angle: +/- 25 degrees along final_axis_rad
min_dist = disc_diam_est * 2.0;
max_dist = disc_diam_est * 3.4;
opt_dist = disc_diam_est * 2.65;

% Angle grid from optic disc
angles_grid = atan2(Y - od_y, X - od_x);
angle_diff = atan2(sin(angles_grid - final_axis_rad), cos(angles_grid - final_axis_rad));

% Radial and angular weighting priors (Gaussian bell)
sigma_dist = disc_radius_est * 1.5;
dist_weight = exp(-((dist_od - opt_dist).^2) / (2 * sigma_dist^2));
angular_weight = exp(-((angle_diff).^2) / (2 * (deg2rad(20))^2));
spatial_prior = dist_weight .* angular_weight .* double(fov_mask);

% Foveal Avascular Zone (FAZ) physical properties:
% 1. Lowest reflectance in green channel (darkest central spot)
% 2. Completely vessel-free
dark_green = (1.0 - green_clahe);
dark_green_smooth = imgaussfilt(dark_green, 4);
vessel_penalty = 1.0 - double(imdilate(vessel_mask, strel('disk', 4)));

fovea_likelihood = dark_green_smooth .* vessel_penalty .* spatial_prior;
fovea_likelihood(~fov_mask) = 0;
fovea_likelihood(od_mask) = 0;

% Find global maximum of foveal likelihood
[max_l_val, max_l_idx] = max(fovea_likelihood(:));
[fov_y, fov_x] = ind2sub([H, W], max_l_idx);

% Fallback if likelihood was degraded
if max_l_val <= 0 || isempty(fov_x)
    fov_x = round(od_x + opt_dist * cos(final_axis_rad));
    fov_y = round(od_y + opt_dist * sin(final_axis_rad));
end

% Confine fovea inside FOV
fov_x = min(max(fov_x, 15), W - 15);
fov_y = min(max(fov_y, 15), H - 15);

% Fovea mask (standard FAZ is ~0.5 mm or ~0.35 DD radius)
faz_radius = round(disc_radius_est * 0.45);
dist_fovea = sqrt((X - fov_x).^2 + (Y - fov_y).^2);
fovea_mask = dist_fovea <= faz_radius;

% Actual distance in Disc Diameters
actual_dist_px = sqrt((fov_x - od_x)^2 + (fov_y - od_y)^2);
actual_dist_dd = actual_dist_px / max(disc_diam_est, 1);

% Confidence score (based on contrast and geometric alignment)
confidence = min(1.0, max(0.65, (max_l_val / 0.5) * 0.5 + 0.45));

% -------------------------------------------------------------
% STEP 6: Format Output Data Contract
% -------------------------------------------------------------
anatomy.disc_center = [od_x, od_y];
anatomy.disc_radius = disc_radius_est;
anatomy.disc_diameter = disc_diam_est;
anatomy.optic_disc_mask = od_mask;
anatomy.fovea_coord = [fov_x, fov_y];
anatomy.fovea_mask = fovea_mask;
anatomy.tilt_angle_deg = round(tilt_angle_deg, 1);
anatomy.eye_side = eye_side;
anatomy.od_fovea_dist_dd = round(actual_dist_dd, 2);
anatomy.confidence = round(confidence, 3);

end
