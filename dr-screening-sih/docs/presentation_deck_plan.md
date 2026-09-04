# 12-Slide Pitch Deck Structure (SIH & MathWorks Grand-Finale Format)

Every slide directly answers one judge scoring criterion.

| Slide # | Slide Title | Key Content & Visual Deliverable | Presenter Strategy |
| :--- | :--- | :--- | :--- |
| **01** | **Title & Problem Framing** | Team name, Problem ID, category. One line: *"77 million diabetics in India, <10% screened annually, 1 ophthalmologist per 100k population in rural districts."* | Hook judges with stark rural health stat. |
| **02** | **Why Existing Solutions Fail** | Cloud-only AI tools fail in rural PHCs due to: 1) Unreliable 2G/4G bandwidth, 2) Poor capture quality (blurry images corrupting cloud AI). | Establish edge-first necessity. |
| **03** | **Solution Overview** | The 5-module architecture diagram showing `dr_struct` flow through Edge IQA -> Segmentation -> Grading -> XAI Report -> Simulink Network. | Single most information-dense slide in deck. |
| **04** | **Module 1 — IQA Gate** | Before/after CLAHE image pair, gradable/ungradable example, and structured reason code UI mockup. Proves gate fires in <200ms BEFORE grading. | Emphasize independent gate architecture. |
| **05** | **Module 2 — Segmentation as Evidence** | One real fundus image with Optic Disc, Fovea, MAs, Hemorrhages, Exudates, and NV vessel-differencing masks overlaid. | Proves model is NOT a black box. |
| **06** | **Module 3 — ICDR Grading & Benchmark** | ROC curve, confusion matrix, headline numbers: **Sensitivity 100% / Specificity 87.5%** for Referable DR across k-fold validation. | Highlight domain-adaptation training. |
| **07** | **Module 4 — The Clinician Report** | Full-screen generated PDF clinician sheet shown for 5 seconds: grade, DME risk flag, lesion table, calibrated confidence, Grad-CAM overlay. | Demonstrate <30s clinician review time. |
| **08** | **Module 5 — Telemedicine Simulation** | Live/recorded Simulink SimEvents run: queue lengths building, packet loss/retries, referable cases jumping queue. | **THE DIFFERENTIATOR SLIDE** — Give it real time! |
| **09** | **What the Simulation Tells Us** | Convert Module 5 output into ONE operational recommendation: *"At 40 PHCs with 120,000 patients/year, 2 specialists yield a 38h wait; we recommend 4 specialists (1:10 ratio)."* | Deliver concrete staffing number. |
| **10** | **Edge Deployment & Feasibility** | MATLAB Coder / GPU Coder export path, target hardware (Jetson Orin Nano), measured 83.7ms latency, and $199 unit cost. | Prove deployability. |
| **11** | **Impact & Scalability** | Patients screenable per year, cost per screening vs. manual visit, rollout path to state telemedicine networks. | Show national scalability. |
| **12** | **Tech Stack Recap** | One slide mapping every module back to its specific MathWorks toolbox (Image Processing, Deep Learning, Simulink, SimEvents, Stateflow, MATLAB Coder). | Closes the loop on MathWorks scoring. |

---

## Delivery Note
Assign the presenter of Module 5's live demo personally — a systems engineer narrating their own discrete-event simulation reads as significantly more credible than reading off a slide script.
