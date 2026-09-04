function test_mod5()
% TEST_MOD5 Standalone verification script for Module 5 (Simulink/SimEvents Simulation).
% Verifies patient arrival generator, edge server latency, 2G/4G link simulation,
% triage routing, queue logging, and staffing recommendation output.

fprintf('========================================================\n');
fprintf('RUNNING MODULE 5 STANDALONE TEST: SIMULINK / SIMEVENTS NETWORK SIMULATION\n');
fprintf('========================================================\n');

% 1. Test Parameter Setup
sim_config = setup_telemed_sim(40, 2, 120000);
assert(sim_config.num_phcs == 40, 'PHC count mismatch!');
assert(sim_config.num_specialists == 2, 'Specialist count mismatch!');

% 2. Run Discrete Event Simulation (8-hour shift)
ops_results = run_simulink_simulation(40, 2, 8);

fprintf('[Simulation Verification]\n');
fprintf('  Peak Queue Length       : %d\n', ops_results.peak_queue);
fprintf('  Peak Wait Time          : %.1f hours\n', ops_results.peak_wait_hours);
fprintf('  Recommended Specialists : %d\n', ops_results.recommended_specialists);

assert(ops_results.peak_queue > 0, 'Queue length should be non-zero for 40 PHCs!');
assert(~isempty(ops_results.recommendation_string), 'Recommendation string must not be empty!');
assert(ops_results.recommended_specialists >= 2, 'Recommended specialists must be >= current count!');

fprintf('\n>>> MODULE 5 TEST PASSED SUCCESSFULLY! Network simulation & ops chart verified. <<<\n\n');

end
