function anatomy = segment_anatomy(img, green_clahe)
% SEGMENT_ANATOMY Detects Optic Disc and Fovea/Macula center coordinates.
% Inputs:
%   img         - Input RGB fundus image (512x512)
%   green_clahe - Preprocessed CLAHE green channel
% Outputs:
%   anatomy     - Struct containing:
%                   .optic_disc_mask (binary 512x512 mask)
%                   .disc_center (1x2 [x, y] coordinates)
%                   .disc_radius (scalar pixel radius)
%                   .fovea_coord (1x2 [x, y] coordinates)

if isinteger(img)
    img = double(img) / 255.0;
end

[H, W, ~] = size(img);
if nargin < 2 || isempty(green_clahe)
    green_clahe = img(:,:,2);
end
if isinteger(green_clahe)
    green_clahe = double(green_clahe) / 255.0;
end

% 1. Optic Disc Detection
% The optic disc is the brightest circular region in the image.
r_channel = img(:,:,1);
bright_map = r_channel * 0.6 + green_clahe * 0.4;
bright_smooth = imgaussfilt(bright_map, 10);

% Find peak region
[~, max_idx] = max(bright_smooth(:));
[max_y, max_x] = ind2sub([H, W], max_idx);

% Fallback/refinement using thresholding around peak
disc_mask = false(H, W);
[X, Y] = meshgrid(1:W, 1:H);
dist_peak = sqrt((X - max_x).^2 + (Y - max_y).^2);
disc_radius_est = round(min(H, W) * 0.08);

disc_mask(dist_peak <= disc_radius_est) = true;

anatomy.optic_disc_mask = disc_mask;
anatomy.disc_center = [max_x, max_y];
anatomy.disc_radius = disc_radius_est;

% 2. Fovea Center Localization (Heatmap Regression / Geometric Prior)
% Fovea is located temporally from optic disc (typically ~2.5 disc diameters away, near Y-center)
% If disc is on nasal side (e.g., x < W/2), fovea is to the right (+X); otherwise to the left (-X).
if max_x < W / 2
    fovea_x_est = min(W - 20, round(max_x + disc_radius_est * 4.5));
else
    fovea_x_est = max(20, round(max_x - disc_radius_est * 4.5));
end
fovea_y_est = max_y; % Roughly same horizontal meridian

% Search dark macula area in local neighborhood
search_r = round(disc_radius_est * 1.5);
y_range = max(1, fovea_y_est - search_r):min(H, fovea_y_est + search_r);
x_range = max(1, fovea_x_est - search_r):min(W, fovea_x_est + search_r);

macula_crop = green_clahe(y_range, x_range);
[~, min_idx] = min(macula_crop(:));
[min_y, min_x] = ind2sub(size(macula_crop), min_idx);

fovea_x = x_range(1) + min_x - 1;
fovea_y = y_range(1) + min_y - 1;

anatomy.fovea_coord = [fovea_x, fovea_y];

end
