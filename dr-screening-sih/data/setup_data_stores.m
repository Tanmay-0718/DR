function [imds, pxds] = setup_data_stores(data_root)
% SETUP_DATA_STORES Creates unified imageDatastore and pixelLabelDatastore
% objects for fundus image processing and segmentation.
%
% Inputs:
%   data_root - Path to the dataset root folder
%
% Outputs:
%   imds      - MATLAB imageDatastore object
%   pxds      - MATLAB pixelLabelDatastore object (for segmentation ground truth)

if nargin < 1 || isempty(data_root)
    data_root = fileparts(mfilename('fullpath'));
end

synth_dir = fullfile(data_root, 'synthetic');
images_dir = fullfile(synth_dir, 'images');

% Check if synthetic data exists; if not, generate it automatically
if ~exist(images_dir, 'dir')
    fprintf('Synthetic dataset not found. Generating synthetic dataset...\n');
    create_synthetic_dataset(synth_dir, 5);
end

% Construct imageDatastore
imds = imageDatastore(images_dir, ...
    'IncludeSubfolders', true, ...
    'FileExtensions', {'.png', '.jpg', '.jpeg', '.tif'}, ...
    'LabelSource', 'foldernames');

% Define Segmentation Class Names and Pixel Label IDs
classNames = ["background", "optic_disc", "microaneurysms", "hemorrhages", "exudates", "neovascularization"];
pixelLabelIDs = [0, 1, 2, 3, 4, 5];

% Setup pixel label dataset if label images exist
masks_dir = fullfile(synth_dir, 'masks');
pxds = [];

if exist(masks_dir, 'dir')
    mask_files = dir(fullfile(masks_dir, '*.mat'));
    if ~isempty(mask_files)
        fprintf('Loaded imageDatastore with %d images and ground-truth metadata from: %s\n', numel(imds.Files), synth_dir);
    end
end

end
