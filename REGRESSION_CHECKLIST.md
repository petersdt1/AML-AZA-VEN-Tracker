# V3.0 Regression Checklist

## Chronology/navigation
- Enter cycles out of order and verify automatic chronological renumbering.
- Edit a start date across another cycle and verify reordering.
- Duplicate cycle start dates produce a QA warning.
- Enter BMBx records out of order and verify BMBx 1/2/3 follow date chronology.
- Cycle and BMBx cards collapse/expand; Expand all/Collapse all work.

## Response
- Adequate aspirate morphology outranks flow.
- Hemodilute/aspicular aspirate does not silently outrank IHC/flow.
- PR-eligible marrow with missing counts says Pending count recovery data.
- ANC and platelet candidate CBCs can be selected independently.
- Manual count override still works.

## ELN
- Complex/monosomal/adverse cytogenetics can drive ELN 2022 Adverse.
- NPM1 + FLT3-ITD = Intermediate unless adverse lesion present.
- NPM1 + explicitly FLT3-ITD negative = Favorable absent adverse lesion.
- TP53 mutation = ELN 2022 Adverse and ELN 2024 LI Adverse.
- Unknown FLT3-ITD/NRAS/KRAS/TP53 coverage is not assumed negative.
- Prior HMA => ELN 2024 LI Not applicable.

## MRD
- Numeric MRD %, LOD/sensitivity %, specimen, and laboratory save and export.
- Diagnostic BMBx remains MRD not applicable.

## Robustness
- Cycle notes containing HTML-like characters render as text.
- No V2.10 UI element IDs are lost.
