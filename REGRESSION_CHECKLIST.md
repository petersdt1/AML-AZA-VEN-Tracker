# V4.1 Regression Checklist

## Reset / CBC
- Clear Current Patient Data removes current and fallback local-storage keys.
- Delete All CBC Observations affects only CBC Trend and requires confirmation.

## Smart Import
- Labels read Date (optional), Source (optional), Diagnostic BMBx.
- Four-domain staging still works.
- Partial acceptance preserves remaining staged records.
- Duplicate cycle/BMBx/ancillary/CBC acceptance prompts UPDATE / ADD / CANCEL.

## BMBx
- Each BMBx Data Details tile always shows its concise overview.
- Edit opens only that domain editor in place.
- Show raw data is independently expandable per domain.
- Full Edit BMBx remains available.
- Needs review and provenance are visible.
- Response CBC recovery and response color coding remain intact.

## Ancillary Studies
- Date → Specimen → Assay.
- Assay-specific structured forms for Flow, NGS, FISH, Cytogenetics, Molecular MRD / PCR.
- Molecular target dropdown includes NPM1, RUNX1::RUNX1T1, CBFB::MYH11, PML::RARA, FLT3-ITD, FLT3-TKD, BCR::ABL1, KMT2A::MLLT3, DEK::NUP214, IDH1, IDH2, WT1, Other.
- Raw source remains available.
- Positive CSF prompts CNS review.
- Positive pleural/ascitic/other-fluid study prompts possible EMD review.

## Timeline
- Existing domain color coding retained.
- No extra tiny text label added.
