# AML AZA/VEN Tracker V4.0

V4.0 is the Smart Import + longitudinal-domain redesign.

## Major changes
- Legacy segmented marrow-import UI removed.
- Smart Import is now the single staging front door for heterogeneous pasted source text.
- One paste can propose records in four independently reviewable domains:
  - Treatment Cycles
  - Bone Marrow (BMBx)
  - Ancillary Studies
  - CBC Trend
- Each domain can be edited, selected/deselected, and accepted independently.
- Embedded CBC observations can be staged separately from a BMBx or note.
- Treatment-cycle statements can create proposed cycle records while preserving the source cycle label separately from chronology-derived cycle numbering.
- New Ancillary Studies tab for peripheral blood, CSF, pleural fluid, and other non-marrow studies.
- Positive CSF studies prompt CNS-involvement adjudication rather than automatically assigning CNS disease.
- Ancillary studies appear on the longitudinal timeline and export separately.
- BMBx cards cleaned up:
  - larger summary header
  - subtle response color coding
  - redundant pretreatment/assessment-detail blocks removed
  - Response CBC Recovery shown directly below PB blasts/EMD/readiness
  - separate Best ANC Response and Best Platelet Response selectors
  - G-CSF and platelet-transfusion 7-day context
  - consolidated BMBx Data Details
  - per-domain Edit buttons for Blast Enumeration, Flow, NGS, Cytogenetics, and FISH
- Treatment Cycles, BMBx, and Ancillary Studies use subtle distinct domain colors that carry into the timeline.

The deterministic ELN 2022 / ELN 2024 LI and response engines remain downstream of extraction.

De-identified prototype only. Do not use public/static hosting for PHI.
