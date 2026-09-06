/**
 * reportSummary.js
 * Plain-language clinical summarization utility for Chakshuh.
 * Translates complex ICDR grades, ETDRS 4-2-1 rules, and 18 biomarkers
 * into a concise, easily understandable summary for patients and non-medical readers.
 */

// Helper to get short single-eye clinical description
function getEyeDescription(result, eyeName) {
  if (!result || result.short_circuited) {
    return `${eyeName}: Retinal photograph could not be graded (blur or quality issue). Recapture advised.`;
  }
  const grade = result.icdr_grade ?? 0;
  const dme = Boolean(result.dme_risk);

  switch (grade) {
    case 0:
      return `${eyeName}: Normal & healthy (Grade 0). No diabetic vessel changes or swelling detected.`;
    case 1:
      return `${eyeName}: Mild changes (Grade 1). A few tiny pinpoint vessel spots (microaneurysms); reading vision is clear and stable.`;
    case 2:
      return `${eyeName}: Moderate diabetic damage (Grade 2). Multiple small bleeding spots${dme ? ' with fluid leakage near central vision (DME alert)' : ''}. Doctor review required.`;
    case 3:
      return `${eyeName}: Severe diabetic damage (Grade 3). Heavy bleeding and vessel blockages detected. High risk of rapid progression without specialist care.`;
    case 4:
      return `${eyeName}: Advanced proliferative retinopathy (Grade 4). Fragile new abnormal blood vessels present. Urgent specialist intervention needed to preserve sight.`;
    default:
      return `${eyeName}: Screening completed. Clinical review advised.`;
  }
}

export function getPlainLanguageSummary(firstArg, secondArg = null, activeEye = 'OD') {
  // Check if called as (odResult, osResult) or (singleResult, activeEye)
  let odResult = null;
  let osResult = null;

  if (secondArg && typeof secondArg === 'object') {
    odResult = firstArg;
    osResult = secondArg;
  } else if (firstArg && typeof firstArg === 'object') {
    if (activeEye === 'OS') {
      osResult = firstArg;
    } else {
      odResult = firstArg;
    }
  }

  // Handle case where neither result is valid
  if (!odResult && !osResult) {
    return {
      statusTitle: "Assessment Incomplete",
      statusColor: "slate",
      statusBadge: "Pending Review",
      headline: "The retinal photograph could not be fully analyzed.",
      explanation: "The uploaded photograph failed quality validation (it was blurry, poorly illuminated, or not a recognized retinal fundus photo).",
      actionRequired: "Please recapture a steady, centered retinal photograph under proper clinic lighting.",
      timeline: "Immediate Re-Capture",
      visionSafety: "Unknown — Image Unclear",
      odSummary: "Right Eye (OD): No gradable scan",
      osSummary: "Left Eye (OS): No gradable scan",
      keyTips: ["Hold still and look directly at the internal green fixation target."]
    };
  }

  // Bilateral examination (both eyes analyzed)
  if (odResult && osResult) {
    const odGrade = odResult.icdr_grade ?? 0;
    const osGrade = osResult.icdr_grade ?? 0;
    const maxGrade = Math.max(odGrade, osGrade);
    const dmeRisk = Boolean(odResult.dme_risk || osResult.dme_risk);
    const referable = Boolean(odResult.referable_dr || osResult.referable_dr);

    const odDesc = getEyeDescription(odResult, "Right Eye (OD)");
    const osDesc = getEyeDescription(osResult, "Left Eye (OS)");

    const combinedExplanation = `${odDesc}\n${osDesc}`;

    return buildSummaryFromGrade(maxGrade, dmeRisk, referable, "both eyes", combinedExplanation, odDesc, osDesc);
  }

  // Unilateral examination (only one eye analyzed)
  const singleResult = odResult || osResult;
  const eyeLabel = odResult ? "Right Eye (OD)" : "Left Eye (OS)";
  const otherEyeLabel = odResult ? "Left Eye (OS)" : "Right Eye (OD)";
  const grade = singleResult.icdr_grade ?? 0;
  const dmeRisk = Boolean(singleResult.dme_risk);
  const referable = Boolean(singleResult.referable_dr);

  const thisEyeDesc = getEyeDescription(singleResult, eyeLabel);
  const otherEyeDesc = `${otherEyeLabel}: Not yet scanned. Bilateral screening recommended for full evaluation.`;
  const combinedExplanation = `${thisEyeDesc}\n${otherEyeDesc}`;

  return buildSummaryFromGrade(grade, dmeRisk, referable, eyeLabel, combinedExplanation, odResult ? thisEyeDesc : otherEyeDesc, osResult ? thisEyeDesc : otherEyeDesc);
}

function buildSummaryFromGrade(grade, dmeRisk, referable, eyeLabel, explanationText, odDesc, osDesc) {
  switch (grade) {
    case 0:
      return {
        statusTitle: "Healthy & Clear Retinal Vessels",
        statusColor: "emerald",
        statusBadge: "No Diabetic Damage",
        headline: "No diabetic eye damage detected in this examination.",
        explanation: explanationText,
        actionRequired: "Maintain a balanced diet and steady blood sugar control. Schedule your next routine tele-screening in 12 months.",
        timeline: "Routine Check-Up in 12 Months",
        visionSafety: "Safe & Clear — Low Risk",
        odSummary: odDesc,
        osSummary: osDesc,
        keyTips: [
          "Aim to keep HbA1c below 7.0% to protect delicate eye capillaries.",
          "Diabetic eye damage has no early symptoms—keep your annual check-up even if your sight feels perfect."
        ]
      };

    case 1:
      return {
        statusTitle: "Early Minor Capillary Changes",
        statusColor: "blue",
        statusBadge: "Early Stage (Watchful)",
        headline: "Very early microvascular changes spotted. Your reading vision is stable.",
        explanation: explanationText,
        actionRequired: "Strict blood glucose and blood pressure management can halt progression. Schedule a follow-up screening in 6 to 12 months.",
        timeline: "Follow-Up in 6–12 Months",
        visionSafety: "Vision Intact — Low Immediate Threat",
        odSummary: odDesc,
        osSummary: osDesc,
        keyTips: [
          "Keep blood pressure under 130/80 mmHg to ease pressure on eye vessels.",
          "Early micro-spots often stabilize when blood glucose levels remain steady."
        ]
      };

    case 2:
      return {
        statusTitle: "Moderate Diabetic Eye Changes",
        statusColor: "amber",
        statusBadge: "Doctor Review Needed",
        headline: `Moderate vessel damage detected${dmeRisk ? ' with risk of fluid near central vision' : ''}.`,
        explanation: explanationText,
        actionRequired: dmeRisk
          ? "Consult an ophthalmologist within 2 to 4 weeks for a dilated exam and macular scan (OCT) to protect central vision."
          : "Consult an eye doctor within 4 to 6 weeks for preventive treatment planning.",
        timeline: dmeRisk ? "Doctor Visit Within 2–4 Weeks" : "Doctor Review Within 4–6 Weeks",
        visionSafety: dmeRisk ? "Action Needed — Risk of Central Vision Blurring" : "Moderate Risk — Preventive Care Required",
        odSummary: odDesc,
        osSummary: osDesc,
        keyTips: [
          "Timely medical treatment at this stage effectively protects long-term vision.",
          "Watch for any wavy lines, blurred text, or distorted vision when reading."
        ]
      };

    case 3:
      return {
        statusTitle: "Severe Retinal Vessel Damage",
        statusColor: "orange",
        statusBadge: "Urgent Specialist Care Required",
        headline: "Significant blood vessel blockages and oxygen shortage detected in the retina.",
        explanation: explanationText,
        actionRequired: "Visit a specialist eye hospital within 48 to 72 hours. Specialized medical intervention (laser or targeted therapy) is required to safeguard your eyesight.",
        timeline: "Urgent Specialist Referral Within 48–72 Hours",
        visionSafety: "High Risk — Prompt Medical Treatment Needed",
        odSummary: odDesc,
        osSummary: osDesc,
        keyTips: [
          "Avoid strenuous physical lifting or heavy straining until evaluated by an eye surgeon.",
          "Take this screening report and images directly to your retina consultation."
        ]
      };

    case 4:
      return {
        statusTitle: "Advanced Proliferative Retinopathy",
        statusColor: "rose",
        statusBadge: "Immediate Action Required",
        headline: "Abnormal new fragile blood vessels have started growing inside the eye.",
        explanation: explanationText,
        actionRequired: "Go to an eye hospital or vitreoretinal specialist immediately (within 24 to 48 hours) for sight-saving laser (PRP) or anti-VEGF injection treatment.",
        timeline: "Immediate Intervention Within 24–48 Hours",
        visionSafety: "Sight-Threatening — Critical Medical Action Required",
        odSummary: odDesc,
        osSummary: osDesc,
        keyTips: [
          "Modern laser and injection treatments are highly effective when done right away.",
          "Seek emergency eye care immediately if you notice sudden dark showers or veil-like loss of vision."
        ]
      };

    default:
      return {
        statusTitle: "Screening Completed",
        statusColor: "slate",
        statusBadge: "Consult Clinician",
        headline: "Screening assessment processed.",
        explanation: explanationText,
        actionRequired: "Follow your ophthalmologist's instructions.",
        timeline: "As Advised by Screener",
        visionSafety: "Requires Medical Correlation",
        odSummary: odDesc,
        osSummary: osDesc,
        keyTips: ["Maintain steady blood sugar and blood pressure control."]
      };
  }
}
