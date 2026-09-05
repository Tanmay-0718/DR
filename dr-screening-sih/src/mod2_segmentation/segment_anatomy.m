function anatomy = segment_anatomy(img, green_clahe)
% SEGMENT_ANATOMY Detects Optic Disc and Fovea/Macula center coordinates.
% Upgraded with rotation-invariant vessel arcade tracing & FAZ localization.
%
% Inputs:
%   img         - Input RGB fundus image (HxW)
%   green_clahe - Preprocessed CLAHE green channel
% Outputs:
%   anatomy     - Struct containing:
%                   .optic_disc_mask (binary mask)
%                   .disc_center (1x2 [x, y] coordinates)
%                   .disc_radius (scalar pixel radius)
%                   .disc_diameter (scalar pixel diameter, 1.0 DD)
%                   .fovea_coord (1x2 [x, y] coordinates)
%                   .fovea_mask (binary FAZ mask)
%                   .tilt_angle_deg (estimated rotation angle in degrees)
%                   .eye_side ('OD' or 'OS')
%                   .od_fovea_dist_dd (distance in DD)
%                   .confidence (localization confidence)

if isinteger(img)
    img = double(img) / 255.0;
end

if nargin < 2 || isempty(green_clahe)
    g_ch = img(:,:,2);
    green_clahe = adapthisteq(g_ch, 'ClipLimit', 0.02, 'Distribution', 'rayleigh');
end
if isinteger(green_clahe)
    green_clahe = double(green_clahe) / 255.0;
end

% Call robust rotation- and angle-invariant localization engine
anatomy = locate_disc_and_fovea_robust(img, green_clahe);

end
