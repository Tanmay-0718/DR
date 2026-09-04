# Module 5: Simulink & SimEvents Telemedicine Network Simulation

## Description
Module 5 models the operational dynamics of a rural telemedicine screening network across 40+ PHCs feeding 1 district hub.
It is built natively using **Simulink** and **SimEvents** to model Poisson patient arrivals, edge inference latency, lognormal 2G/4G rural link bandwidth variability with an 8% packet loss/retry queue, priority triage routing (Level 0/1 local resolution vs. Level 2+ referable cases), and parallel ophthalmologist review queues.

It logs queue lengths, end-to-end latency, and link utilization to the workspace, generates the headline operations chart (`telemed_operations_chart.png`), and derives a concrete staffing-ratio recommendation (e.g. recommending 4 specialists for 40 PHCs to maintain turnaround times under 2 hours).

## Key Dependencies & Toolboxes
- **Simulink**: Model architecture & workspace signal logging
- **SimEvents**: Entity Generator, Entity Server, Priority Queue, Entity Gate
- **Stateflow**: Triage routing logic

## Function Specifications
- `setup_telemed_sim.m`: Constructs & configures SimEvents network parameters.
- `run_simulink_simulation.m`: Runs discrete-event simulation, logs queue metrics, plots headline ops chart, and outputs staffing recommendation.
- `test_mod5.m`: Standalone verification test.

## Standalone Execution
To test Module 5 independently in MATLAB:
```matlab
addpath('dr-screening-sih/src/mod5_simulink');
test_mod5();
```
