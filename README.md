# AML AZA/VEN Tracker V2.10

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

## Blast-percentage parser patch
- Flow blast extraction recognizes `myeloblasts` in addition to `blasts` and `myeloid blasts`.
- Pathology text such as `Flow cytometry reports increased aberrant myeloblasts, 30%` now supplies the structured flow blast percentage.
- Aspirate differential tables with `Blast %` on one line and the numeric value on the next line are now parsed.
- If flow-blast wording is found but the percentage still fails extraction, Quick Import shows a QA warning rather than silently falling back.


## Raw-source review in Edit Marrow
- Each structured subsection now includes a collapsed, read-only `Show raw source` area.
- Flow shows the original raw flow report.
- NGS shows both the detected-variant text and the genes-tested text.
- Conventional cytogenetics shows the original karyotype text.
- FISH shows the original FISH report text.
- MRD shows stored MRD target/result or method note when available.
- The raw source stays collapsed by default so the editor remains compact, but coordinators can copy missed abnormalities directly into `+ Add marker`, `+ Add variant`, `+ Add abnormality`, or `+ Add FISH result`.


## V2.9 parser / QA release
V2.9 intentionally freezes the V2.8 UI and changes parser/data-quality logic only.

- Bone-marrow differential tables such as `Blast %    3.5` are parsed as aspirate blasts while remaining scoped away from peripheral-blood blast rows.
- Flow phenotype modifiers are scoped to the marker phrase they actually modify.
- FISH extraction is line-based and conservative; explicit assay lines are primary and summary positives only fill findings not already represented.
- FISH parsing no longer concatenates conventional cytogenetic text.
- `cytoHits` is now derived only from structured present conventional-cytogenetic observations and structured positive FISH observations. Negative FISH text cannot create a positive hit.
- WHO/ICC AML-MR conventional-cytogenetic preview now evaluates parsed present conventional abnormalities instead of raw-string substring matches.
- Existing V2.8 tabs, editors, raw-source review, MRD, CBC, treatment, outcomes, timeline, and export UI are regression-checked during this build.

## V2.9 marrow-card / editor refinement
- The V2.9 parser fixes remain unchanged.
- In Edit Marrow, blast-source values now live as the first subsection under Structured data review, alongside Flow, NGS, cytogenetics, FISH, and MRD.
- The Blast assessment subsection includes the raw pathology source and a live preferred-blast calculation preview.
- Bone-marrow cards now use two executive-summary rows:
  1. Blasts + Genomic / cytogenetic summary
  2. Calculated response + MRD (MRD omitted for diagnostic marrows)
- The biology summary is positive-only and compact; the complete parsed Flow/NGS/FISH details remain available below.
- No V2.8 element IDs were removed.


## V2.10 response-readiness and normalization release
- PB blasts no longer default to absent after Quick Import. Explicit peripheral-smear blast % is captured when available; otherwise status is Unknown.
- EMD defaults to Unknown unless adjudicated.
- Bone-marrow cards provide direct PB-blast and EMD controls for rapid response completion.
- Non-diagnostic marrows show response readiness and missing variables.
- Missing PB/EMD/count data no longer silently produces a finalized response category.
- Aspirate adequacy is captured and used in the preferred-blast hierarchy.
- Conventional cytogenetic parsing preserves marker chromosomes and derivative losses such as +mar1 and -der(...).
- FISH/cytogenetic observations keep raw source wording plus canonical and broader AML concepts.
- Executive molecular/cytogenetic summary excludes VUS and de-duplicates normalized concepts.
- Expanded parsed details now include Conventional cytogenetics.
