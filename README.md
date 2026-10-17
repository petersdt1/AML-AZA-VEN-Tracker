# AML HMA/VEN Longitudinal Tracker — V1 Prototype

Static GitHub Pages prototype for designing a de-identified AML HMA/VEN longitudinal abstraction workflow.

## Important
- Prototype/test use only.
- Do **not** enter names, MRNs, DOBs, or other PHI.
- Data are kept only in the current browser session unless exported.
- This is not yet a shared database or production research system.

## V1 features
- Diagnosis date indexed as Study Day 0
- Patient/baseline disease and molecular data
- Unlimited HMA/VEN cycles
- Derived cycle boundaries and durations
- Independent marrow entry with automatic cycle/day assignment
- Preliminary ELN 2022 response calculation
- Count recovery dates indexed to diagnosis and cycle
- Outcomes
- Timeline and QA warnings
- CSV exports for patients, cycles, marrows, and events
- Full JSON export

## GitHub Pages
Upload `index.html` to the repository root. In repository Settings → Pages, choose **Deploy from a branch**, `main`, `/ (root)`, then Save.
