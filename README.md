# AML AZA/VEN Tracker V2.5

V2.5 focuses on genetics, flow, FISH, and CBC parser fidelity.

## Changes
- NGS is variant-level rather than gene-level.
- Any gene can contain an unlimited number of detected variants.
- Each detected variant is preserved separately with gene, protein change, cDNA change, transcript, VAF, classification, and raw source wording when available.
- Gene-level tested/not-detected status is added only when the gene is explicitly listed as assayed and no detected variant for that gene was found.
- VUS recognition includes VUS, unknown significance, uncertain significance, variant of unknown/uncertain significance, and Tier III/Tier 3.
- VUS remain excluded from ELN-driving mutation logic and display in amber with `(VUS)`.
- Flow observations are consolidated by marker/result.
- Repeated flow observations and repeated intensity terms are deduplicated.
- User-facing flow display is simplified to forms such as `CD34 Positive (dim)`.
- No modifier is shown when none is actually reported.
- Truly discordant positive/negative results for the same marker are retained separately and flagged.
- FISH is parsed into structured positive/negative observations while preserving raw text.
- Structured FISH appears in both extraction staging and marrow details.
- CBC staging now reports WBC, ANC, Hgb, platelets, and complete four-value CBC sets.
- Manual CBC editing supports all four values.
- Marrow export includes structured detected NGS variants and FISH observations as JSON.

## Important
The NGS, flow, FISH, cytogenetic, blast-source, and ELN parsers remain prototype extraction logic and require formal validation against source reports before production research use.

## Safety
FAKE / DE-IDENTIFIED TEST DATA ONLY. This static GitHub prototype is not an approved research database.
