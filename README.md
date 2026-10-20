# AML AZA/VEN Tracker V4.1

V4.1 is a workflow and editing refinement of V4.0.

## Major changes
- Smart Import labels simplified to Date (optional), Source (optional), and Diagnostic BMBx.
- True in-place BMBx domain editing for Blast Enumeration, Blast Immunophenotype, NGS, Conventional Cytogenetics, and FISH.
- Every BMBx detail tile keeps its concise overview while editing.
- Every BMBx detail tile has an independent Show raw data section.
- Tile-level provenance and Needs review badges.
- Full Edit BMBx remains available.
- Ancillary Studies now uses Date → Specimen → Assay with dynamic assay-specific forms.
- Flow, NGS, FISH, Cytogenetics, and Molecular MRD / PCR use structured editors.
- Molecular targets include NPM1, RUNX1::RUNX1T1, CBFB::MYH11, PML::RARA, FLT3-ITD, FLT3-TKD, BCR::ABL1, KMT2A::MLLT3, DEK::NUP214, IDH1, IDH2, WT1, and Other.
- Positive CSF studies prompt CNS adjudication; positive non-CSF fluid studies prompt possible EMD review.
- Smart Import duplicate detection offers UPDATE / ADD / CANCEL for likely duplicate cycles, BMBx, ancillary studies, and CBC observations.
- CBC Trend has Delete All CBC Observations at the bottom.
- Clear Current Patient Data now clears current and fallback storage keys, fixing the previous reset failure.
- Existing timeline/domain color coding is preserved without adding an extra tiny text label.

De-identified prototype only. Do not use public/static hosting for PHI.
