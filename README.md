# AML AZA/VEN Tracker V2.4

V2.4 adds data-normalization and baseline abstraction refinements.

## Changes
- All user-entered dates are plain-text fields.
- Accepts common formats such as 2/4/24, 2/4/2024, 02/04/2024, 2024-02-04, and 2-4-2024.
- Dates normalize to MM/DD/YYYY for display while remaining ISO internally.
- NGS parser recognizes VUS / Tier III / Tier 3 / variant-of-uncertain-significance wording.
- Detected VUS are explicitly labeled "(VUS)" and shown amber.
- VUS do not contribute to ELN-driving mutation logic.
- Baseline CBC automatically selects one complete pretreatment CBC on the diagnostic marrow date when possible, otherwise the nearest complete CBC within ±14 days.
- Ties favor the pre-marrow CBC.
- Manual baseline-CBC override is available.
- Baseline CBC timing is displayed consistently as Dx−N, Dx+0, or Dx+N relative to the final diagnosis date.
- Diagnostic cytogenetics are automatically categorized with transparent parser evidence:
  normal, abnormal non-complex/non-monosomal, complex, monosomal, complex + monosomal, failed/insufficient, or unknown.
- Cytogenetic category can be manually overridden.
- Raw diagnostic cytogenetics and FISH remain visible.

## Important
The cytogenetic categorizer is a transparent prototype heuristic, not a validated clinical cytogenetics engine. Complex/monosomal karyotype and ELN logic require formal validation before production research use.

## Safety
FAKE / DE-IDENTIFIED TEST DATA ONLY. This static GitHub prototype is not an approved research database.
