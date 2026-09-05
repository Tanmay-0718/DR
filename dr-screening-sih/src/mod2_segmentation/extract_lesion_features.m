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

cws_mask = false(size(ma_mask));
scar_mask = false(size(ma_mask));
irma_mask = false(size(ma_mask));

if isfield(lesion_masks, 'cotton_wool_spots')
    cws_mask = lesion_masks.cotton_wool_spots;
end
if isfield(lesion_masks, 'retinal_scarring')
    scar_mask = lesion_masks.retinal_scarring;
end
if isfield(lesion_masks, 'irma')
    irma_mask = lesion_masks.irma;
end

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
all_lesions = ma_mask | hem_mask | exudate_mask | nv_mask | cws_mask | scar_mask;
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

% 7. Cotton Wool Spots (Soft Exudates)
cc_cws = bwconncomp(cws_mask);
cws_count = cc_cws.NumObjects;
has_cws = double(cws_count >= 2);

% 8. Retinal Wall Scarring (PRP Laser Burns & Fibrovascular Proliferation)
% Clinically, panretinal photocoagulation (PRP) involves dozens to hundreds of circular laser spots
cc_scar = bwconncomp(scar_mask);
scar_count = cc_scar.NumObjects;
has_retinal_scarring = double(scar_count >= 15);

% 9. Intraretinal Microvascular Abnormalities (IRMA)
cc_irma = bwconncomp(irma_mask);
irma_count = cc_irma.NumObjects;
has_irma = double(irma_count >= 3);

% 10. PRP Geometric Regularity & Peripheral Arc Pattern (Macula-Sparing Grid)
prp_pattern_score = 0.0;
if scar_count >= 15
    [s_y, s_x] = find(scar_mask);
    if ~isempty(s_y)
        min_fov_d = min(sqrt((s_x - fovea_coord(1)).^2 + (s_y - fovea_coord(2)).^2));
        macular_clearance = min(1.0, min_fov_d / 50.0);
        
        angles = atan2(s_y - fovea_coord(2), s_x - fovea_coord(1));
        hist_angles = histcounts(angles, -pi:pi/2:pi);
        active_quads = sum(hist_angles >= 3);
        quad_score = min(1.0, active_quads / 3.0);
        
        prp_pattern_score = 0.6 * quad_score + 0.4 * macular_clearance;
    end
end

% 11. Melanin Pigment Halo Specificity Ratio (Distinguishes Laser Burns from Exudates/CWS)
pigment_halo_ratio = 0.0;
if isfield(lesion_masks, 'pigment_halo_mask') && scar_count > 0
    halo_pix = sum(lesion_masks.pigment_halo_mask(:));
    pigment_halo_ratio = min(1.0, halo_pix / max(1, scar_count * 8));
end

% 12. ETDRS 4-Quadrant Hemorrhage Density (Rule "4" for Grade 3)
quadrant_hem_density = 0;
st_hems = 0; sn_hems = 0; it_hems = 0; in_hems = 0;
st_vb = 0; sn_vb = 0; it_vb = 0; in_vb = 0;
st_irma = 0; sn_irma = 0; it_irma = 0; in_irma = 0;

if isfield(lesion_masks, 'quadrants')
    q = lesion_masks.quadrants;
    st_hems = sum(hem_mask(:) & q.st(:));
    sn_hems = sum(hem_mask(:) & q.sn(:));
    it_hems = sum(hem_mask(:) & q.it(:));
    in_hems = sum(hem_mask(:) & q.in(:));
    
    quad_counts = [st_hems, sn_hems, it_hems, in_hems];
    quadrant_hem_density = sum(quad_counts >= 15);
    
    % Venous Beading per quadrant (Rule "2")
    if isfield(lesion_masks, 'venous_beading')
        vb_mask = lesion_masks.venous_beading;
        st_vb = sum(vb_mask(:) & q.st(:));
        sn_vb = sum(vb_mask(:) & q.sn(:));
        it_vb = sum(vb_mask(:) & q.it(:));
        in_vb = sum(vb_mask(:) & q.in(:));
    end
    
    % IRMA per quadrant (Rule "1")
    if isfield(lesion_masks, 'irma')
        st_irma = sum(irma_mask(:) & q.st(:));
        sn_irma = sum(irma_mask(:) & q.sn(:));
        it_irma = sum(irma_mask(:) & q.it(:));
        in_irma = sum(irma_mask(:) & q.in(:));
    end
else
    quadrant_hem_density = min(4, floor(hem_count / 15));
    quad_counts = [floor(hem_count/4), floor(hem_count/4), floor(hem_count/4), floor(hem_count/4)];
end

quad_vb_counts = [st_vb, sn_vb, it_vb, in_vb];
vb_quad_count = sum(quad_vb_counts >= 15);

quad_irma_counts = [st_irma, sn_irma, it_irma, in_irma];
irma_quad_count = sum(quad_irma_counts >= 15);

% ETDRS 4-2-1 Rule Evaluator:
% Rule "4": Severe Hemorrhages in all 4 quadrants (>=20 lesions or density=4)
rule_4_hem_met = (quadrant_hem_density == 4) || (hem_count >= 80 && quadrant_hem_density >= 3);

% Rule "2": Definite Venous Beading (VB) in >= 2 quadrants
rule_2_vb_met = (vb_quad_count >= 2);

% Rule "1": Prominent IRMA in >= 1 quadrant
rule_1_irma_met = (irma_quad_count >= 1) && (hem_count >= 5 || irma_count >= 4);

% Composite ETDRS 4-2-1 Score: 0 (Not Met), 1 (Severe NPDR), >= 2 (Very Severe NPDR)
etdrs_421_score = double(rule_4_hem_met) + double(rule_2_vb_met) + double(rule_1_irma_met);
is_very_severe_npdr = double(etdrs_421_score >= 2);

% Diabetic Microvascular Guardrail:
% Diabetic Venous Beading & IRMA are ischemic complications of established DR.
% In a normal retina with 0 MAs, 0 Hemorrhages, and negligible exudates,
% physiological branching caliber changes cannot be diabetic venous beading.
if (ma_count == 0 && hem_count == 0 && exudate_area_pct < 0.05)
    vb_quad_count = 0;
    quad_vb_counts = [0, 0, 0, 0];
    rule_2_vb_met = false;
    irma_quad_count = 0;
    quad_irma_counts = [0, 0, 0, 0];
    rule_1_irma_met = false;
    rule_4_hem_met = false;
    etdrs_421_score = 0;
    is_very_severe_npdr = 0;
end

% 13. Fibrovascular Traction Band Proliferation Score
fibrotic_traction_score = 0.0;
if isfield(lesion_masks, 'fibrous_scars')
    fib_pix = sum(lesion_masks.fibrous_scars(:));
    if fib_pix > 50 && (scar_count >= 15 || has_nv > 0 || hem_count >= 5 || ma_count >= 5)
        fibrotic_traction_score = min(1.0, fib_pix / 400.0);
    end
end

features.ma_count = ma_count;
features.hem_count = hem_count;
features.exudate_area_pct = exudate_area_pct;
features.disc_to_lesion_dist = disc_to_lesion_dist;
features.has_nv = has_nv;
features.fovea_exudate_dist = fovea_exudate_dist;
features.cws_count = cws_count;
features.has_cws = has_cws;
features.scar_count = scar_count;
features.has_retinal_scarring = has_retinal_scarring;
features.irma_count = irma_count;
features.has_irma = has_irma;
features.prp_pattern_score = prp_pattern_score;
features.pigment_halo_ratio = pigment_halo_ratio;
features.quadrant_hem_density = quadrant_hem_density;
features.fibrotic_traction_score = fibrotic_traction_score;

% ETDRS 4-2-1 Rule Struct Fields
features.quad_hem_counts = quad_counts;
features.quad_vb_counts = quad_vb_counts;
features.quad_irma_counts = quad_irma_counts;
features.vb_quad_count = vb_quad_count;
features.irma_quad_count = irma_quad_count;
features.rule_4_hem_met = rule_4_hem_met;
features.rule_2_vb_met = rule_2_vb_met;
features.rule_1_irma_met = rule_1_irma_met;
features.etdrs_421_score = etdrs_421_score;
features.is_very_severe_npdr = is_very_severe_npdr;

% Consolidated feature vector (1x18 numerical vector for CNN fusion)
features.feature_vector = [ ...
    ma_count, ...
    hem_count, ...
    exudate_area_pct, ...
    disc_to_lesion_dist, ...
    has_nv, ...
    fovea_exudate_dist, ...
    cws_count, ...
    has_retinal_scarring, ...
    has_irma, ...
    scar_count, ...
    prp_pattern_score, ...
    pigment_halo_ratio, ...
    quadrant_hem_density, ...
    fibrotic_traction_score, ...
    vb_quad_count, ...
    etdrs_421_score, ...
    irma_quad_count, ...
    is_very_severe_npdr];

end
