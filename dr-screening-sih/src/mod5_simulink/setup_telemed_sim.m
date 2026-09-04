function sim_config = setup_telemed_sim(num_phcs, num_specialists, annual_patient_volume)
% SETUP_TELEMED_SIM Configures parameters for Module 5 SimEvents Telemedicine Network Simulation.
% Model Parameters:
%   - Patient arrivals: Poisson process for 100,000+ patients/year across N PHCs (e.g. 40 PHCs -> 1 district hub)
%   - Edge inference: Service time = Module 1-3 measured latency (~185 ms)
%   - 2G/4G link: Service time = payload_size (3.2 KB) / effective_bandwidth (Lognormal 250 Kbps mean) + 8% packet loss/retry
%   - Triage routing: Level 0/1 -> local PHC (fast, low priority); Level 2+ -> district ophthalmologist priority queue
%   - Specialist servers: N ophthalmologists, review time ~ Lognormal(mean=4.0 min, std=1.0 min)
%
% Inputs:
%   num_phcs              - Number of primary health centers (default: 40)
%   num_specialists       - Number of district ophthalmologists (default: 2)
%   annual_patient_volume - Total annual patient load (default: 120,000)
% Outputs:
%   sim_config            - Parameter struct for SimEvents simulation engine

if nargin < 1 || isempty(num_phcs), num_phcs = 40; end
if nargin < 2 || isempty(num_specialists), num_specialists = 2; end
if nargin < 3 || isempty(annual_patient_volume), annual_patient_volume = 120000; end

sim_config.num_phcs = num_phcs;
sim_config.num_specialists = num_specialists;
sim_config.annual_patient_volume = annual_patient_volume;

% Calculate Poisson arrival rate per PHC in patients per second
% Operating hours: 300 days/year, 8 hours/day = 2,400 hours = 8.64e6 seconds
operating_seconds_per_year = 300 * 8 * 3600;
arrival_rate_per_phc_per_sec = (annual_patient_volume / num_phcs) / operating_seconds_per_year;
sim_config.mean_interarrival_sec = 1.0 / max(1e-6, arrival_rate_per_phc_per_sec);

% Edge Inference Stage
sim_config.edge_latency_sec = 0.185; % 185 ms measured edge latency

% Transmission Link (Result packet ONLY: 3.2 KB, NOT full image!)
sim_config.payload_size_kb = 3.2;
sim_config.mean_bandwidth_kbps = 250; % 250 Kbps 2G/4G rural connection
sim_config.link_service_time_sec = (sim_config.payload_size_kb * 8) / sim_config.mean_bandwidth_kbps; % ~0.102 sec
sim_config.packet_loss_probability = 0.08; % 8% packet loss/retry rate

% Triage Distribution (ICDR Grade Probabilities from rural screening data)
% Grade 0: 65%, Grade 1: 15%, Grade 2: 12%, Grade 3: 5%, Grade 4: 3%
sim_config.grade_distribution = [0.65, 0.15, 0.12, 0.05, 0.03];
sim_config.referable_ratio = sum(sim_config.grade_distribution(3:5)); % 20% referable cases

% Specialist Review Time Distribution (in minutes and seconds)
sim_config.specialist_review_mean_min = 4.0; % 4 minutes per referable case
sim_config.specialist_review_mean_sec = 4.0 * 60; % 240 seconds

fprintf('SimEvents Network Simulation Configured:\n');
fprintf('  PHC Count               : %d\n', num_phcs);
fprintf('  District Ophthalmologists: %d\n', num_specialists);
fprintf('  Annual Patient Volume   : %d patients/year\n', annual_patient_volume);
fprintf('  Mean Interarrival per PHC: %.1f seconds\n', sim_config.mean_interarrival_sec);
fprintf('  Referable Case Ratio    : %.1f%%\n', sim_config.referable_ratio * 100);

end
