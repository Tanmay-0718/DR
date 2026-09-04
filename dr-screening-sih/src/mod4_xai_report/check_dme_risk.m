function [dme_risk, min_dist_px, dist_disc_diameters] = check_dme_risk(exudate_mask, fovea_coord, disc_radius)
% CHECK_DME_RISK Computes Diabetic Macular Edema (DME) risk based on clinical rule:
% Flag DME risk if any hard exudate falls within 1 disc diameter of the fovea.
%
% Inputs:
%   exudate_mask         - Binary mask of hard exudates (512x512)
%   fovea_coord          - [x, y] coordinates of fovea center
%   disc_radius          - Optic disc pixel radius (disc diameter = 2 * disc_radius)
% Outputs:
%   dme_risk             - Boolean (true if DME risk present, false otherwise)
%   min_dist_px          - Minimum distance in pixels from exudates to fovea center
%   dist_disc_diameters  - Distance measured in optic disc diameters (1 DD = 2 * disc_radius)

disc_diameter = disc_radius * 2.0;

[ex_y, ex_x] = find(exudate_mask);

if isempty(ex_y)
    min_dist_px = Inf;
    dist_disc_diameters = Inf;
    dme_risk = false;
    return;
end

dists = sqrt((ex_x - fovea_coord(1)).^2 + (ex_y - fovea_coord(2)).^2);
min_dist_px = min(dists);
dist_disc_diameters = min_dist_px / disc_diameter;

% Clinical rule: Exudates within 1.0 disc diameter of fovea -> DME risk
dme_risk = (dist_disc_diameters <= 1.0);

end
