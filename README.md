# AML AZA/VEN Tracker V2.6

V2.6 restores key marrow-response and outcomes fields while keeping the saved marrow interface compact.

## Changes
- Removed the Qualifying variants summary tile.
- Diagnostic marrow cards show Blasts and Calculated response / baseline status only.
- Post-treatment marrow cards show Blasts, Calculated response, and MRD.
- MRD status: Positive, Negative, Indeterminate, Not performed, or Unknown.
- Multiple MRD methods can be selected: MFC, PCR/qPCR/dPCR, NGS, or Other.
- Optional MRD target/result and Other-method text are supported.
- Peripheral-blood blasts and extramedullary disease are visible again in saved marrow assessments.
- Marrow notes/adjudication notes are displayed when present.
- Permanent HMA/VEN discontinuation and reason are restored in Outcomes.
- MRD-only recurrence remains separate from morphologic/hematologic relapse and does not auto-populate relapse date.
- Raw source reports are not re-displayed on the marrow page; Quick Import remains the source-review step.

## Safety
FAKE / DE-IDENTIFIED TEST DATA ONLY. This static GitHub prototype is not an approved research database.

## Validation
The MRD, NGS, flow, FISH, cytogenetic, blast-source, response, and ELN logic remain prototype workflow logic and require formal validation before production research use.
