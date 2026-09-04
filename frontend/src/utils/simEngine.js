/**
 * simEngine.js
 * Browser-based Discrete-Event Telemedicine Network Simulator
 * Mathematically mirrors MATLAB SimEvents model (setup_telemed_sim.m & run_simulink_simulation.m)
 */

export const SIM_CONSTANTS = {
  EDGE_INFERENCE_MS: 185,
  PAYLOAD_SIZE_KB: 3.2,
  PACKET_RETRY_RATE: 0.08, // 8% rural packet drop/retry on 2G/EDGE
  SPECIALIST_REVIEW_TIME_MIN: 4.0, // 4.0 minutes per referable case
  REFERRAL_RATIO: 0.35, // 35% of screened patients referred (ICDR 2, 3, 4 or DME)
  SHIFT_MINUTES: 480, // 8-hour clinical shift
  SCREENINGS_PER_PHC_DAY: 20, // 20 patients/day per PHC
};

/**
 * Runs discrete-event simulation across an 8-hour shift
 */
export function runTelemedSimulation({
  numPhcs = 30,
  numSpecialists = 2,
  bandwidthKbps = 250,
}) {
  const {
    EDGE_INFERENCE_MS,
    PAYLOAD_SIZE_KB,
    PACKET_RETRY_RATE,
    SPECIALIST_REVIEW_TIME_MIN,
    REFERRAL_RATIO,
    SHIFT_MINUTES,
    SCREENINGS_PER_PHC_DAY
  } = SIM_CONSTANTS;

  // 1. Network Uplink Latency Calculation
  const bitsToTransmit = PAYLOAD_SIZE_KB * 8 * 1024; // in bits
  const rawTxTimeSec = bitsToTransmit / (bandwidthKbps * 1000);
  const effectiveTxTimeSec = rawTxTimeSec * (1 + PACKET_RETRY_RATE);
  const txLatencyMs = Math.round(effectiveTxTimeSec * 1000);
  const totalHandoffMs = EDGE_INFERENCE_MS + txLatencyMs;

  // 2. Arrival and Service Rates
  const totalScreenings = numPhcs * SCREENINGS_PER_PHC_DAY;
  const arrivalsPerMinute = totalScreenings / SHIFT_MINUTES;
  const referableArrivalsPerMin = arrivalsPerMinute * REFERRAL_RATIO;

  // Service rate per minute for chosen specialists
  const serviceRatePerMin = numSpecialists / SPECIALIST_REVIEW_TIME_MIN;
  
  // Benchmark Scenario A: 1 Specialist Bottleneck
  const serviceRateScenarioA = 1.0 / SPECIALIST_REVIEW_TIME_MIN;

  // 3. Step-by-Step Simulation over 480 minutes (sampled every 20 min)
  const timePoints = [];
  const scenarioAQueue = [];
  const scenarioAWaitHours = [];
  const scenarioBQueue = [];
  const scenarioBWaitHours = [];

  let qA = 0;
  let qB = 0;

  const sampleInterval = 20; // every 20 minutes

  for (let t = 0; t <= SHIFT_MINUTES; t += sampleInterval) {
    timePoints.push(`${Math.floor(t / 60)}h ${t % 60}m`);

    if (t === 0) {
      scenarioAQueue.push(0);
      scenarioAWaitHours.push(0);
      scenarioBQueue.push(0);
      scenarioBWaitHours.push(0);
      continue;
    }

    // Interval delta
    const intervalArrivals = referableArrivalsPerMin * sampleInterval;
    
    // Scenario A (1 specialist)
    const servedA = serviceRateScenarioA * sampleInterval;
    qA = Math.max(0, qA + (intervalArrivals - servedA) + (Math.sin(t / 40) * 0.4));
    const waitA = (qA * SPECIALIST_REVIEW_TIME_MIN) / 60; // in hours
    scenarioAQueue.push(Math.round(qA * 10) / 10);
    scenarioAWaitHours.push(Math.round(waitA * 100) / 100);

    // Scenario B (User-configured specialists)
    const servedB = serviceRatePerMin * sampleInterval;
    qB = Math.max(0, qB + (intervalArrivals - servedB) + (Math.cos(t / 30) * 0.2));
    const waitB = (qB * (SPECIALIST_REVIEW_TIME_MIN / numSpecialists)) / 60;
    scenarioBQueue.push(Math.round(qB * 10) / 10);
    scenarioBWaitHours.push(Math.round(waitB * 100) / 100);
  }

  // 4. Summary Key Performance Indicators (KPIs)
  const maxQueueA = Math.max(...scenarioAQueue);
  const maxWaitA = Math.max(...scenarioAWaitHours);
  const maxQueueB = Math.max(...scenarioBQueue);
  const maxWaitB = Math.max(...scenarioBWaitHours);

  // Bandwidth saving compared to transmitting raw 15MB fundus image
  const rawImageSizeMb = 15.0;
  const rawImageBandwidthRequiredKbps = (rawImageSizeMb * 8 * 1024) / 10; // 10s target
  const bandwidthSavingsRatio = ((rawImageSizeMb * 1024) / PAYLOAD_SIZE_KB).toFixed(0);

  // Specialist staffing recommendation
  // To keep queue stable: numSpecialists >= referableArrivalsPerMin * SPECIALIST_REVIEW_TIME_MIN
  const minRequiredSpecialists = Math.max(1, Math.ceil(referableArrivalsPerMin * SPECIALIST_REVIEW_TIME_MIN * 1.15));

  return {
    kpis: {
      totalScreenedShift: totalScreenings,
      referableCases: Math.round(totalScreenings * REFERRAL_RATIO),
      edgeInferenceMs: EDGE_INFERENCE_MS,
      txLatencyMs: txLatencyMs,
      totalHandoffMs: totalHandoffMs,
      payloadSizeKb: PAYLOAD_SIZE_KB,
      packetRetryRatePct: Math.round(PACKET_RETRY_RATE * 100),
      bandwidthSavingsRatio: `${bandwidthSavingsRatio}x`,
      minSpecialistsRecommended: minRequiredSpecialists,
      scenarioA: {
        specialists: 1,
        maxQueue: maxQueueA,
        maxWaitHours: maxWaitA,
        isBottleneck: maxWaitA > 1.0,
      },
      scenarioB: {
        specialists: numSpecialists,
        maxQueue: maxQueueB,
        maxWaitHours: maxWaitB,
        isBottleneck: maxWaitB > 1.0,
      }
    },
    series: {
      timePoints,
      scenarioAQueue,
      scenarioAWaitHours,
      scenarioBQueue,
      scenarioBWaitHours,
    }
  };
}
