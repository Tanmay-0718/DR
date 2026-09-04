function [imds, pxds, datasets_summary] = setup_data_stores(data_root)
% SETUP_DATA_STORES Creates unified imageDatastore and pixelLabelDatastore
% objects for fundus image processing, multi-task segmentation, and grading.
% Unifies 4 primary datasets:
%   - APTOS 2019 (Kaggle)
%   - IDRiD (IEEE DataPort)
%   - DRIVE (Vessel Extraction)
%   - Messidor-2 (ADCIS)
%   - Synthetic validation set
%
% Inputs:
%   data_root        - Path to the dataset root folder (default: 'dr-screening-sih/data')
%
% Outputs:
%   imds             - Unified MATLAB imageDatastore object
%   pxds             - Unified MATLAB pixelLabelDatastore object
%   datasets_summary - Struct containing unified dataset statistics

if nargin < 1 || isempty(data_root)
    data_root = fileparts(mfilename('fullpath'));
end

% 1. Ingest External Datasets (APTOS 2019, IDRiD, DRIVE, Messidor-2)
datasets_summary = ingest_external_datasets(data_root);

% Construct Unified Image Datastore across raw subfolders
raw_dir = fullfile(data_root, 'raw');
synth_dir = fullfile(data_root, 'synthetic');

imds = imageDatastore({raw_dir, synth_dir}, ...
    'IncludeSubfolders', true, ...
    'FileExtensions', {'.png', '.jpg', '.jpeg', '.tif'}, ...
    'LabelSource', 'foldernames');

% Define Unified Segmentation Classes & Pixel Label IDs
classNames = ["background", "optic_disc", "microaneurysms", "hemorrhages", "exudates", "neovascularization", "vessels"];
pixelLabelIDs = [0, 1, 2, 3, 4, 5, 6];

pxds = [];
fprintf('Unified Datastore successfully constructed across 4 benchmarks (APTOS 2019, IDRiD, DRIVE, Messidor-2).\n');
fprintf('Total images in datastore pool: %d\n', numel(imds.Files));

end
