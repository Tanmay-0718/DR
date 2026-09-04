function [preprocessed_img, green_clahe] = preprocess_image(img, target_size)
% PREPROCESS_IMAGE Enhances fundus image for segmentation and grading backbones.
% Pipeline:
%   1. CLAHE via adapthisteq on green channel
%   2. Illumination normalization via large-kernel Gaussian background subtraction
%   3. Resize/pad to backbone target size (default: 512x512)
%
% Inputs:
%   img             - Input RGB fundus image (uint8 or double)
%   target_size     - [H, W] target dimensions (default: [512, 512])
% Outputs:
%   preprocessed_img - Standardized 3-channel RGB image
%   green_clahe     - High-contrast 1-channel CLAHE green image

if nargin < 2 || isempty(target_size)
    target_size = [512, 512];
end

if isinteger(img)
    img = double(img) / 255.0;
end

% Extract channels
r = img(:,:,1);
g = img(:,:,2);
b = img(:,:,3);

% 1. CLAHE on green channel (enhances contrast of vessels and lesions)
green_clahe = adapthisteq(g, 'ClipLimit', 0.02, 'Distribution', 'uniform');

% 2. Large-kernel Gaussian background subtraction for illumination normalization
bg_blur = imgaussfilt(green_clahe, 30);
g_norm = green_clahe - bg_blur + 0.5;
g_norm = min(max(g_norm, 0), 1);

% Normalize red and blue channels similarly
r_bg = imgaussfilt(r, 30);
r_norm = min(max(r - r_bg + 0.5, 0), 1);

b_bg = imgaussfilt(b, 30);
b_norm = min(max(b - b_bg + 0.5, 0), 1);

% Combine into 3-channel preprocessed image
preprocessed_img = cat(3, r_norm, g_norm, b_norm);

% 3. Resize to target backbone dimensions
if size(preprocessed_img, 1) ~= target_size(1) || size(preprocessed_img, 2) ~= target_size(2)
    preprocessed_img = imresize(preprocessed_img, target_size);
    green_clahe = imresize(green_clahe, target_size);
end

end
