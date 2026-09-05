function [nv_mask, nv_metrics] = detect_neovascularization(img, anatomy)
% DETECT_NEOVASCULARIZATION Detects Neovascularization (abnormal fine vessel proliferation)
% via vessel-map differencing near the optic disc margin.
%
% Inputs:
%   img        - Input RGB fundus image (512x512)
%   anatomy    - Anatomy struct containing .disc_center, .disc_radius, .optic_disc_mask
% Outputs:
%   nv_mask    - Binary mask of detected neovascularization regions
%   nv_metrics - Struct with peripapillary vessel density, tortuosity index, and NV flag

if isinteger(img)
    img = double(img) / 255.0;
end

[H, W, ~] = size(img);
g_ch = img(:,:,2);

disc_center = anatomy.disc_center;
disc_r = anatomy.disc_radius;

% 1. Peripapillary Ring ROI (1.0 to 2.5 disc radii from disc center)
[X, Y] = meshgrid(1:W, 1:H);
dist_disc = sqrt((X - disc_center(1)).^2 + (Y - disc_center(2)).^2);
ring_roi = (dist_disc >= disc_r * 1.1) & (dist_disc <= disc_r * 2.5);

% 2. Multi-scale vessel enhancement (Matched Filter / Morphological top-hat)
se = strel('disk', 3);
top_hat = imtophat(1 - g_ch, se);
vessels_bin = imbinarize(top_hat, 'adaptive', 'Sensitivity', 0.55);
vessels_bin(anatomy.optic_disc_mask) = 0; % Mask out main disc area

% 3. Extract vessels in peripapillary ROI
nv_candidates = vessels_bin & ring_roi;
roi_pixel_count = max(1, sum(ring_roi(:)));
peripapillary_vessel_density = sum(nv_candidates(:)) / roi_pixel_count;

% 4. Isolate Fine Proliferative Microvessels from Primary Arcade Trunks
% Normal retinal vessels passing through the disc ring occupy 15-30% of the ring.
% True Neovascularization at the Disc (NVD) features fine, disorganized microvascular fronds (<2.5 px),
% NOT the thick primary arcade trunks.
thick_trunks = imopen(nv_candidates, strel('disk', 2));
fine_candidates = nv_candidates & ~thick_trunks;

fine_skel = bwskel(fine_candidates);
fine_branches = bwmorph(fine_skel, 'branchpoints');
fine_branch_density = sum(fine_branches(:)) / max(1, sum(fine_skel(:)));
fine_density = sum(fine_candidates(:)) / roi_pixel_count;

% 5. Differencing against Normal Vascular Baseline
% Normal retinas have fine_branch_density ~ 0.015 - 0.035.
% True active NVD exhibits tangled proliferation: fine_density > 0.12, fine_branch_density > 0.075,
% and total peripapillary density > 0.38 (hyper-vascular proliferation).
has_nv = (peripapillary_vessel_density > 0.38) && ...
         (fine_branch_density > 0.075) && ...
         (fine_density > 0.12) && ...
         (sum(fine_candidates(:)) > 250);

if has_nv
    nv_mask = fine_candidates;
else
    nv_mask = false(H, W);
end

nv_metrics.peripapillary_vessel_density = peripapillary_vessel_density;
nv_metrics.fine_density = fine_density;
nv_metrics.branch_density = fine_branch_density;
nv_metrics.has_neovascularization = has_nv;

end
