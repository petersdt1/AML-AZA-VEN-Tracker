# AML AZA/VEN Tracker V2.7

V2.7 narrows flow extraction to the AML blast phenotype, adds conditional MRD entry to Quick Import, and adds a compact conventional-cytogenetics preview with granular export.

## Changes
- Flow parsing now targets only the leukemic/blast or abnormal myeloid immunophenotype.
- Gating text, antibody-panel lists, normal B-cell/T-cell/NK phenotypes, and unrelated populations are not used to create AML phenotype chips.
- If a blast/abnormal-population phenotype cannot be confidently identified, staging reports `Blast immunophenotype not confidently extracted` rather than summarizing the whole flow report.
- Flow display remains compact: e.g. `CD34 Positive (dim)`.
- Quick Import now has conditional MRD entry for non-diagnostic marrows.
- Diagnostic marrow: MRD entry is hidden/not applicable.
- Follow-up marrow: `MRD assessed?` is shown; detailed MRD status/method/target fields appear only when Yes.
- Extraction staging now previews:
  - Blast immunophenotype
  - NGS
  - Conventional cytogenetic descriptor(s)
  - Positive WHO/ICC AML-MR cytogenetic abnormalities
  - FISH
  - MRD when assessed
- Conventional cytogenetics preview is intentionally compact: Normal, Abnormal, Complex, Monosomal, Failed/insufficient, or combinations such as Complex + Monosomal.
- WHO/ICC AML-MR preview uses the union of defining cytogenetic abnormalities from WHO 5th edition and ICC 2022 and shows positive findings only.
- Individual conventional-cytogenetic abnormalities are preserved as structured observations.
- Added Cytogenetics CSV and FISH CSV exports with one observation per row.
- Marrows CSV/JSON also retain structured cytogenetic and FISH observations.

## WHO/ICC composite used for preview
The prototype union includes complex karyotype; 5q loss; -7/del(7q); +8; del(11q); 12p loss; -13/del(13q); 17p loss/-17; i(17q); del(20q); and idic(X)(q13), with schema-specific flags retained internally.

## Important
The flow, cytogenetic, FISH, NGS, MRD, response, and ELN logic remain prototype extraction logic and require formal validation before production research use.

## Safety
FAKE / DE-IDENTIFIED TEST DATA ONLY. This static GitHub prototype is not an approved research database.


## Structured marrow editing patch
- `Edit marrow` now contains one collapsible **Structured data review** area.
- The structured review is auto-populated from the parser-confirmed marrow.
- Flow shows only stored blast-phenotype observations; each row can be retained/removed, result corrected, and an optional phenotype modifier selected.
- NGS shows one editable row per detected variant, including gene, protein change, cDNA change, VAF, and classification. Multiple variants in any gene remain separate.
- Conventional cytogenetic abnormalities are individually retainable/editable, with a compact derived category preview.
- FISH observations are individually retainable/editable with result status.
- MRD is now housed inside Structured data review; it remains hidden/not applicable for diagnostic marrows.
- The checkbox in Flow/NGS/Cytogenetics/FISH means **keep this observation**, not positive/negative. Result status is stored separately.
