# AML AZA/VEN Tracker V4.2

V4.2 completes the in-place BMBx editing redesign.

## BMBx layout
- Expanded BMBx card is now the complete editing workspace.
- Top summary remains:
  - Blasts
  - Cytogenetic / Molecular Summary
  - Calculated response
- BMBx Assessment now groups all response-context data:
  - marrow date
  - diagnostic / baseline status
  - peripheral-blood blasts
  - extramedullary disease
  - best ANC response and date
  - best platelet response and date
  - response window
  - response readiness
  - G-CSF / platelet-transfusion context when editing
- Best ANC and platelet selectors remain independent and constrained to the defined response window.
- BMBx Data Details is permanently visible rather than nested in another collapsible parent.
- Individual in-place editors remain for:
  - Blast Enumeration
  - Blast Immunophenotype
  - NGS
  - Conventional Cytogenetics
  - FISH
  - MRD
- Edit all BMBx fields expands the assessment and all structured domain editors in place. No separate full-BMBx editor needs to be launched from the card.

## MRD
- MRD tile is present for every marrow.
- Diagnostic marrow displays N/A — diagnostic marrow but retains the MRD tile and Edit action.
- Post-treatment MRD editor is assay-aware:
  - Flow cytometry
  - NGS
  - Molecular PCR/qPCR
  - Other
- MRD remains marrow-linked while analogous non-marrow assays remain in Ancillary Studies.
- Existing compatibility MRD fields are retained for response/readiness logic and export.

All V4.1 Smart Import, Ancillary Studies, CBC, duplicate detection, reset, color coding, and timeline behavior are preserved.

De-identified prototype only. Do not use public/static hosting for PHI.
