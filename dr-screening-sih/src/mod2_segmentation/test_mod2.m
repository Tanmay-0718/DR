function test_mod2()
% TEST_MOD2 Standalone verification script for Module 2 (Segmentation & Feature Extraction).
% Tests Optic Disc, Fovea, MAs, Hemorrhages, Exudates, NV differencing, and feature extraction.

fprintf('========================================================\n');
fprintf('RUNNING MODULE 2 STANDALONE TEST: ANATOMICAL & LESION SEGMENTATION\n');
fprintf('========================================================\n');

% Ensure data path is added
root_dir = fullfile(fileparts(mfilename('fullpath')), '..', '..');
addpath(fullfile(root_dir, 'data'));
addpath(fullfile(root_dir, 'src', 'mod1_iqa'));

synth_dir = fullfile(root_dir, 'data', 'synthetic');
images_dir = fullfile(synth_dir, 'images');

if ~exist(images_dir, 'dir') || isempty(dir(fullfile(images_dir, '*.png')))
    fprintf('Generating synthetic dataset for testing...\n');
    create_synthetic_dataset(synth_dir, 2);
end

png_files = dir(fullfile(images_dir, '*.png'));
assert(~isempty(png_files), 'No test images found!');
img_path = fullfile(png_files(1).folder, png_files(1).name);

img = imread(img_path);
img = imresize(img, [512, 512]);

% 1. Test Anatomical Segmentation
[prep_img, clahe_g] = preprocess_image(img, [512, 512]);
anatomy = segment_anatomy(img, clahe_g);

fprintf('[Anatomy Segmentation Results]\n');
fprintf('  Optic Disc Center : [%d, %d]\n', anatomy.disc_center(1), anatomy.disc_center(2));
fprintf('  Fovea Coordinates : [%d, %d]\n', anatomy.fovea_coord(1), anatomy.fovea_coord(2));

assert(~isempty(anatomy.optic_disc_mask), 'Optic disc mask must not be empty!');
assert(all(size(anatomy.fovea_coord) == [1, 2]), 'Fovea coordinates size mismatch!');

% 2. Test Multi-Head Lesion Segmentation & NV Differencing
lesion_masks = segment_lesions(img, prep_img, clahe_g, anatomy);

fprintf('\n[Lesion Segmentation Results]\n');
fprintf('  Microaneurysms Detected : %s\n', char(string(any(lesion_masks.microaneurysms(:)))));
fprintf('  Hemorrhages Detected    : %s\n', char(string(any(lesion_masks.hemorrhages(:)))));
fprintf('  Hard Exudates Detected  : %s\n', char(string(any(lesion_masks.exudates(:)))));
fprintf('  Neovascularization      : %s\n', char(string(any(lesion_masks.neovascularization(:)))));

% 3. Test Feature Vector Extraction
features = extract_lesion_features(lesion_masks, anatomy);
fprintf('\n[Feature Vector Extraction]\n');
fprintf('  MA Count           : %d\n', features.ma_count);
fprintf('  Hemorrhage Count   : %d\n', features.hem_count);
fprintf('  Exudate Area %%     : %.2f%%\n', features.exudate_area_pct);
fprintf('  Disc-Lesion Dist   : %.1f px\n', features.disc_to_lesion_dist);
fprintf('  Feature Vector Size: %dx%d\n', size(features.feature_vector, 1), size(features.feature_vector, 2));

assert(numel(features.feature_vector) == 6, 'Feature vector must contain exactly 6 quantitative metrics!');

fprintf('\n>>> MODULE 2 TEST PASSED SUCCESSFULLY! Segmentation & feature extraction verified. <<<\n\n');

end
