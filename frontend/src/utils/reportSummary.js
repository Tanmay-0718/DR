/**
 * reportSummary.js
 * Plain-language clinical summarization utility for Chakshuh.
 * Translates complex ICDR grades, ETDRS 4-2-1 rules, and 18 biomarkers
 * into a concise, easily understandable summary for patients and non-medical readers.
 */

export function getPlainLanguageSummary(result, activeEye = 'OD') {
  if (!result || result.short_circuited) {
    return {
      statusTitle: "Assessment Incomplete",
      statusColor: "slate",
      statusBadge: "Pending Review",
      headline: "The retinal photograph could not be fully analyzed.",
      explanation: "The uploaded photograph failed quality validation (it was blurry, poorly illuminated, or not a recognized retinal fundus photo).",
      actionRequired: "Please recapture a steady, centered retinal photograph under proper clinic lighting.",
      timeline: "Immediate Re-Capture",
      visionSafety: "Unknown — Image Unclear",
      keyTips: ["Hold still and look directly at the internal green fixation target."]
    };
  }

  const grade = result.icdr_grade ?? 0;
  const dmeRisk = Boolean(result.dme_risk);
  const referable = Boolean(result.referable_dr);
  const eyeLabel = activeEye === 'OD' ? 'Right Eye (OD)' : (activeEye === 'OS' ? 'Left Eye (OS)' : 'Both Eyes');

  switch (grade) {
    case 0:
      return {
        statusTitle: "Healthy & Clear Retinal Vessels",
        statusColor: "emerald",
        statusBadge: "No Diabetic Damage",
        headline: "No diabetic eye damage detected in this scan.",
        explanation: `Your ${eyeLabel} scan shows normal, healthy blood vessels. There are no swelling, leaking, or bleeding spots.`,
        actionRequired: "Keep up healthy diet and regular blood sugar management. Schedule your next routine diabetic eye check in 12 months.",
        timeline: "Routine Check-Up in 12 Months",
        visionSafety: "Safe & Clear — Low Risk",
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
        headline: "Very early microvascular changes spotted. Your eyesight is currently stable.",
        explanation: `A few tiny microaneurysms (pinpoint vessel bulges) were detected in your ${eyeLabel}. There is no bleeding or swelling near your central reading vision.`,
        actionRequired: "Strict blood sugar and blood pressure management can prevent this from worsening. Schedule a follow-up eye screening in 6 to 12 months.",
        timeline: "Follow-Up in 6–12 Months",
        visionSafety: "Vision Intact — Low Immediate Threat",
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
        headline: `Multiple small bleeding spots and fluid leakage detected${dmeRisk ? ' near central vision' : ''}.`,
        explanation: `Weakened blood vessels in your ${eyeLabel} are beginning to leak tiny blood spots and proteins.${dmeRisk ? ' Warning: Some fluid is collecting near the central vision zone (macula).' : ''}`,
        actionRequired: dmeRisk
          ? "See an eye doctor (Ophthalmologist) within 2 to 4 weeks for a dilated examination and macular scan (OCT) to prevent central vision blurring."
          : "Consult an eye doctor within 4 to 6 weeks for preventive treatment planning.",
        timeline: dmeRisk ? "Doctor Visit Within 2–4 Weeks" : "Doctor Review Within 4–6 Weeks",
        visionSafety: dmeRisk ? "Action Needed — Risk of Central Vision Blurring" : "Moderate Risk — Preventive Care Required",
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
        headline: "Significant blood vessel blockages and oxygen shortage detected.",
        explanation: `Multiple sectors of your ${eyeLabel} show heavy bleeding spots and swollen, irregular veins (ETDRS 4-2-1 criteria met). The retina is starved of oxygen and at high risk of rapid decline.`,
        actionRequired: "Visit a specialist eye hospital within 48 to 72 hours. Specialized medical intervention (laser or targeted therapy) is required to safeguard your eyesight.",
        timeline: "Urgent Specialist Referral Within 48–72 Hours",
        visionSafety: "High Risk — Prompt Medical Treatment Needed",
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
        explanation: `Severe oxygen starvation has forced new, weak blood vessels to sprout across your ${eyeLabel}. These fragile vessels bleed easily into the eye, creating sudden vision shadows or floaters.`,
        actionRequired: "Go to an eye hospital or vitreoretinal specialist immediately (within 24 to 48 hours) for sight-saving laser (PRP) or anti-VEGF injection treatment.",
        timeline: "Immediate Intervention Within 24–48 Hours",
        visionSafety: "Sight-Threatening — Critical Medical Action Required",
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
        explanation: "Please consult your attending physician to correlate findings with your overall diabetes care plan.",
        actionRequired: "Follow your ophthalmologist's instructions.",
        timeline: "As Advised by Screener",
        visionSafety: "Requires Medical Correlation",
        keyTips: ["Maintain steady blood sugar and blood pressure control."]
      };
  }
}
