function dataset_info = create_synthetic_dataset(output_dir, num_samples_per_grade)
% CREATE_SYNTHETIC_DATASET Generates synthetic fundus images and ground-truth masks
% for all 5 ICDR grades (0-4), ungradable cases, and synthetic Neovascularization (NV).
%
% Inputs:
%   output_dir            - Root folder where images and labels will be saved (default: 'dr-screening-sih/data/synthetic')
%   num_samples_per_grade - Number of synthetic images per grade (default: 5)
%
% Outputs:
%   dataset_info          - Table/Struct containing metadata for generated images

if nargin < 1 || isempty(output_dir)
    output_dir = fullfile(fileparts(mfilename('fullpath')), 'synthetic');
end
if nargin < 2 || isempty(num_samples_per_grade)
    num_samples_per_grade = 5;
end

images_dir = fullfile(output_dir, 'images');
masks_dir = fullfile(output_dir, 'masks');
if ~exist(images_dir, 'dir'), mkdir(images_dir); end
if ~exist(masks_dir, 'dir'), mkdir(masks_dir); end

rng(42); % Reproducible generation

image_size = [512, 512];
records = {};
count = 0;

% Define categories to generate
% Grades 0..4 + Ungradable (Blur, Illumination, FOV)
categories = {
    0, 'Grade_0_No_DR', 'pass';
    1, 'Grade_1_Mild_DR', 'pass';
    2, 'Grade_2_Moderate_DR', 'pass';
    3, 'Grade_3_Severe_DR', 'pass';
    4, 'Grade_4_PDR', 'pass';
    -1, 'Ungradable_Blur', 'blur';
    -1, 'Ungradable_Illum', 'illumination';
    -1, 'Ungradable_FOV', 'fov_cutoff'
};

fprintf('Generating synthetic fundus dataset in: %s\n', output_dir);

for cat_idx = 1:size(categories, 1)
    grade = categories{cat_idx, 1};
    cat_name = categories{cat_idx, 2};
    iqa_reason = categories{cat_idx, 3};
    
    n_gen = num_samples_per_grade;
    if grade == -1, n_gen = 3; end % Generate 3 per ungradable type
    
    for i = 1:n_gen
        count = count + 1;
        img_filename = sprintf('fundus_%03d_%s.png', count, cat_name);
        img_path = fullfile(images_dir, img_filename);
        mask_path = fullfile(masks_dir, sprintf('mask_%03d_%s.mat', count, cat_name));
        
        is_gradable = strcmp(iqa_reason, 'pass');
        effective_grade = grade;
        if ~is_gradable
            effective_grade = -1;
        end
        
        [img, masks, meta] = generate_single_fundus(image_size, effective_grade, iqa_reason);
        
        imwrite(img, img_path);
        save(mask_path, '-struct', 'masks');
        
        records{end+1, 1} = count; %#ok<AGROW>
        records{end, 2} = img_filename;
        records{end, 3} = img_path;
        records{end, 4} = mask_path;
        records{end, 5} = effective_grade;
        records{end, 6} = is_gradable;
        records{end, 7} = iqa_reason;
        records{end, 8} = meta.dme_risk;
        records{end, 9} = meta.ma_count;
        records{end, 10} = meta.hem_count;
        records{end, 11} = meta.exudate_area_pct;
        records{end, 12} = meta.has_nv;
    end
end

dataset_info = cell2table(records, 'VariableNames', { ...
    'ID', 'Filename', 'ImagePath', 'MaskPath', 'ICDR_Grade', ...
    'IsGradable', 'IQAReason', 'DMERisk', 'MACount', 'HemCount', ...
    'ExudateAreaPct', 'HasNV'});

summary_path = fullfile(output_dir, 'dataset_summary.csv');
writetable(dataset_info, summary_path);
fprintf('Dataset generation complete. Total samples: %d\nSaved summary to: %s\n', count, summary_path);

end

function [img, masks, meta] = generate_single_fundus(sz, grade, iqa_reason)
    H = sz(1); W = sz(2);
    [X, Y] = meshgrid(1:W, 1:H);
    
    % 1. FOV Mask (Circular aperture)
    center_x = W / 2; center_y = H / 2;
    radius = min(H, W) * 0.45;
    if strcmp(iqa_reason, 'fov_cutoff')
        radius = min(H, W) * 0.25; % Severely clipped FOV
    end
    dist_from_center = sqrt((X - center_x).^2 + (Y - center_y).^2);
    fov_mask = dist_from_center <= radius;
    
    % 2. Base Retinal Color Background (Reddish-orange with vignetting)
    r_channel = 0.75 * (1 - 0.2 * (dist_from_center / radius).^2);
    g_channel = 0.35 * (1 - 0.3 * (dist_from_center / radius).^2);
    b_channel = 0.10 * (1 - 0.4 * (dist_from_center / radius).^2);
    
    % 3. Optic Disc (Nasal side ellipse)
    disc_x = W * 0.30; disc_y = H * 0.50;
    disc_r_x = W * 0.08; disc_r_y = H * 0.09;
    disc_mask = (((X - disc_x)/disc_r_x).^2 + ((Y - disc_y)/disc_r_y).^2) <= 1 & fov_mask;
    
    r_channel(disc_mask) = 0.95;
    g_channel(disc_mask) = 0.85;
    b_channel(disc_mask) = 0.40;
    
    % 4. Fovea / Macula (Temporal to optic disc)
    fovea_x = W * 0.65; fovea_y = H * 0.50;
    fovea_r = W * 0.07;
    fovea_dist = sqrt((X - fovea_x).^2 + (Y - fovea_y).^2);
    fovea_region = fovea_dist <= fovea_r & fov_mask;
    
    g_channel(fovea_region) = g_channel(fovea_region) * 0.7;
    r_channel(fovea_region) = r_channel(fovea_region) * 0.8;
    
    % 5. Primary Vessel Arcades
    vessel_mask = false(H, W);
    theta1 = linspace(-pi/3, pi/3, 100);
    r_arcade = W * 0.22;
    arc1_x = round(disc_x + r_arcade * cos(theta1));
    arc1_y = round(disc_y + r_arcade * sin(theta1));
    valid1 = arc1_x >= 1 & arc1_x <= W & arc1_y >= 1 & arc1_y <= H;
    for k = find(valid1)
        vessel_mask(max(1, arc1_y(k)-2):min(H, arc1_y(k)+2), max(1, arc1_x(k)-2):min(W, arc1_x(k)+2)) = true;
    end
    
    g_channel(vessel_mask & fov_mask) = 0.15;
    r_channel(vessel_mask & fov_mask) = 0.45;
    
    % Initialize Lesion Masks
    ma_mask = false(H, W);
    hem_mask = false(H, W);
    exudate_mask = false(H, W);
    nv_mask = false(H, W);
    
    ma_count = 0;
    hem_count = 0;
    exudate_area_pct = 0;
    has_nv = false;
    
    % 6. Generate Lesions based on ICDR Grade
    if grade >= 1 % Mild DR (Microaneurysms)
        ma_count = randi([5, 15]);
        for k = 1:ma_count
            rx = randi([round(W*0.2), round(W*0.8)]);
            ry = randi([round(H*0.2), round(H*0.8)]);
            if fov_mask(ry, rx) && ~disc_mask(ry, rx)
                rr = randi([1, 2]);
                ma_mask(max(1, ry-rr):min(H, ry+rr), max(1, rx-rr):min(W, rx+rr)) = true;
            end
        end
        r_channel(ma_mask) = 0.3; g_channel(ma_mask) = 0.05; b_channel(ma_mask) = 0.05;
    end
    
    if grade >= 2 % Moderate DR (MAs + Hemorrhages + Hard Exudates)
        hem_count = randi([4, 10]);
        for k = 1:hem_count
            rx = randi([round(W*0.25), round(W*0.75)]);
            ry = randi([round(H*0.25), round(H*0.75)]);
            if fov_mask(ry, rx) && ~disc_mask(ry, rx)
                rr = randi([3, 6]);
                hem_mask(max(1, ry-rr):min(H, ry+rr), max(1, rx-rr):min(W, rx+rr)) = true;
            end
        end
        r_channel(hem_mask) = 0.25; g_channel(hem_mask) = 0.02; b_channel(hem_mask) = 0.02;
        
        ex_count = randi([3, 8]);
        for k = 1:ex_count
            rx = randi([round(W*0.4), round(W*0.7)]);
            ry = randi([round(H*0.3), round(H*0.7)]);
            if fov_mask(ry, rx) && ~disc_mask(ry, rx)
                rr = randi([3, 7]);
                exudate_mask(max(1, ry-rr):min(H, ry+rr), max(1, rx-rr):min(W, rx+rr)) = true;
            end
        end
        r_channel(exudate_mask) = 0.95; g_channel(exudate_mask) = 0.95; b_channel(exudate_mask) = 0.40;
    end
    
    if grade >= 3 % Severe DR (Abundant Hemorrhages & MAs)
        extra_hem = randi([12, 25]);
        hem_count = hem_count + extra_hem;
        for k = 1:extra_hem
            rx = randi([round(W*0.15), round(W*0.85)]);
            ry = randi([round(H*0.15), round(H*0.85)]);
            if fov_mask(ry, rx) && ~disc_mask(ry, rx)
                rr = randi([4, 9]);
                hem_mask(max(1, ry-rr):min(H, ry+rr), max(1, rx-rr):min(W, rx+rr)) = true;
            end
        end
        r_channel(hem_mask) = 0.20; g_channel(hem_mask) = 0.01; b_channel(hem_mask) = 0.01;
    end
    
    if grade == 4 || (grade == -1 && rand() > 0.5) % Grade 4 PDR or synthetic NV positive
        has_nv = true;
        % Generate synthetic Neovascularization (abnormal fine vessel fronds near disc margin)
        nv_center_x = disc_x + disc_r_x * 1.1;
        nv_center_y = disc_y;
        [nv_grid_x, nv_grid_y] = meshgrid(1:W, 1:H);
        nv_dist = sqrt((nv_grid_x - nv_center_x).^2 + (nv_grid_y - nv_center_y).^2);
        
        % Fine tortuous vessel strands
        fine_lines = (sin(nv_grid_x * 0.15) .* cos(nv_grid_y * 0.15)) > 0.6;
        nv_mask = (nv_dist <= W * 0.12) & fine_lines & fov_mask;
        
        r_channel(nv_mask) = 0.40; g_channel(nv_mask) = 0.08; b_channel(nv_mask) = 0.08;
    end
    
    % Assemble RGB image
    img = cat(3, r_channel, g_channel, b_channel);
    img(~repmat(fov_mask, [1, 1, 3])) = 0; % Zero outside FOV
    
    % Apply artifacts for ungradable images
    if strcmp(iqa_reason, 'blur')
        img = imgaussfilt(img, 12); % Severe blur
    elseif strcmp(iqa_reason, 'illumination')
        img = img * 0.15; % Dark / underexposed image
    end
    
    % Clamp values
    img = min(max(img, 0), 1);
    
    % Calculate metadata
    exudate_area_pct = (sum(exudate_mask(:)) / sum(fov_mask(:))) * 100;
    
    % DME Risk check (Exudates within 1 disc diameter of fovea)
    disc_diameter_pixels = disc_r_x * 2;
    [ex_y, ex_x] = find(exudate_mask);
    dme_risk = false;
    if ~isempty(ex_y)
        min_dist = min(sqrt((ex_x - fovea_x).^2 + (ex_y - fovea_y).^2));
        if min_dist <= disc_diameter_pixels
            dme_risk = true;
        end
    end
    
    masks.optic_disc = disc_mask;
    masks.fovea_coord = [fovea_x, fovea_y];
    masks.microaneurysms = ma_mask;
    masks.hemorrhages = hem_mask;
    masks.exudates = exudate_mask;
    masks.neovascularization = nv_mask;
    masks.fov_mask = fov_mask;
    
    meta.ma_count = ma_count;
    meta.hem_count = hem_count;
    meta.exudate_area_pct = exudate_area_pct;
    meta.has_nv = has_nv;
    meta.dme_risk = dme_risk;
end
