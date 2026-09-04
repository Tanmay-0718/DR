function features = extract_lesion_features(lesion_masks, anatomy)
% EXTRACT_LESION_FEATURES Extracts hand-crafted quantitative lesion feature vector
% for feature fusion in Module 3 grading.
%
% Inputs:
%   lesion_masks - Struct with binary masks for MAs, hemorrhages, exudates, NV
%   anatomy      - Struct with optic disc mask and fovea coordinates
% Outputs:
%   features     - Struct and vector containing:
%                    .ma_count
%                    .hem_count
%                    .exudate_area_pct
%                    .disc_to_lesion_dist
%                    .has_nv
%                    .feature_vector (1x6 numerical vector for CNN fusion)

ma_mask = lesion_masks.microaneurysms;
hem_mask = lesion_masks.hemorrhages;
exudate_mask = lesion_masks.exudates;
nv_mask = lesion_masks.neovascularization;

disc_center = anatomy.disc_center;
fovea_coord = anatomy.fovea_coord;

% 1. MA Count (connected components)
cc_ma = bwconncomp(ma_mask);
ma_count = cc_ma.NumObjects;

% 2. Hemorrhage Count (connected components)
cc_hem = bwconncomp(hem_mask);
hem_count = cc_hem.NumObjects;

% 3. Exudate Area Percentage
total_pixels = numel(exudate_mask);
exudate_area_pct = (sum(exudate_mask(:)) / total_pixels) * 100;

% 4. Minimum Disc-to-Lesion Distance (in pixels)
all_lesions = ma_mask | hem_mask | exudate_mask | nv_mask;
[lesion_y, lesion_x] = find(all_lesions);

if isempty(lesion_y)
    disc_to_lesion_dist = max(size(ma_mask)); % Default maximum distance if no lesions
else
    dists = sqrt((lesion_x - disc_center(1)).^2 + (lesion_y - disc_center(2)).^2);
    disc_to_lesion_dist = min(dists);
end

% 5. Neovascularization Flag
has_nv = double(any(nv_mask(:)));

% 6. Fovea-to-Exudate Minimum Distance
[ex_y, ex_x] = find(exudate_mask);
if isempty(ex_y)
    fovea_exudate_dist = max(size(ma_mask));
else
    dists_fov = sqrt((ex_x - fovea_coord(1)).^2 + (ex_y - fovea_coord(2)).^2);
    fovea_exudate_dist = min(dists_fov);
end

features.ma_count = ma_count;
features.hem_count = hem_count;
features.exudate_area_pct = exudate_area_pct;
features.disc_to_lesion_dist = disc_to_lesion_dist;
features.has_nv = has_nv;
features.fovea_exudate_dist = fovea_exudate_dist;

% Consolidated 1x6 feature vector for classification fusion
features.feature_vector = [ ...
    ma_count, ...
    hem_count, ...
    exudate_area_pct, ...
    disc_to_lesion_dist, ...
    has_nv, ...
    fovea_exudate_dist];

end
