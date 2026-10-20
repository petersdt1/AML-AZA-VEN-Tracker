# V4.0 Regression Checklist

## Smart Import
- Mixed paste stages Treatment Cycle, BMBx, Ancillary, and CBC records independently.
- Each proposed record can be selected/deselected.
- Each domain can be accepted independently.
- Accepted cycles are renumbered by chronology, not source cycle label.
- Embedded CBC data enter the CBC timeline independently.
- Legacy segmented marrow-import UI is absent.

## Ancillary Studies
- Manual add/edit/delete works.
- PB/CSF/pleural/other specimen types are retained.
- Ancillary events appear on Timeline/QA.
- Positive CSF study with CNS status Unknown creates an adjudication warning.
- CNS involvement status/date/basis persist.
- Ancillary CSV exports.

## BMBx
- Calculated response remains visible when inputs are available.
- CR/CRh/CRi use subtle green; MLFS softer green; PR amber; No response red; pending amber; baseline/pretreatment blue.
- Best ANC and platelet selectors remain independent.
- ANC and platelets may come from different dates inside the response window.
- G-CSF and platelet-transfusion context is visible.
- Redundant pretreatment information block removed.
- Redundant BMBx assessment-details block removed.
- BMBx Data Details contains Blast Enumeration, Blast Immunophenotype, NGS, Conventional Cytogenetics, and FISH.
- Each BMBx data subsection has an Edit button.
- Full Edit BMBx remains available.

## Timeline
- Treatment cycles have subtle blue/lavender coding.
- BMBx events have subtle teal/green coding.
- Ancillary studies have subtle amber coding.
