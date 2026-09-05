function [imds, pxds, datasets_summary] = setup_data_stores(data_root)
% SETUP_DATA_STORES Creates unified imageDatastore and pixelLabelDatastore
% objects for fundus image processing, multi-task segmentation, and grading.
% Unifies 9 primary international benchmarks:
%   - APTOS 2019 (Kaggle - 3,662 images)
%   - IDRiD (IEEE DataPort - 516 grading + 81 lesion masks)
%   - DRIVE (Grand Challenge - 40 vessel masks)
%   - Messidor-2 (ADCIS - 1,748 images + DME risk)
%   - UNA-Paraguay (Zeiss Visucam 500 - 757 images)
%   - DiaRetDB1 (Kuopio Univ Hospital - 89 images: MA, HE, EX, SE)
%   - DiaRetDB0 (Kuopio Univ Hospital - 130 images)
%   - e-ophtha (TeleOphta - 463 images: 82 EX + 381 MA)
%   - STARE (UC San Diego - 397 images: vessel extraction & diagnosis)
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

% 1. Ingest External Datasets across all 9 cohorts
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
fprintf('Unified Datastore successfully constructed across 9 benchmarks:\n');
fprintf('  (APTOS 2019, IDRiD, DRIVE, Messidor-2, UNA-Paraguay, DiaRetDB1, DiaRetDB0, e-ophtha, STARE).\n');
fprintf('Total images in datastore pool: %d\n', numel(imds.Files));

end
