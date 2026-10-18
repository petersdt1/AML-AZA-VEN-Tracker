# AML AZA/VEN Tracker V2.3

V2.3 is a usability/QI patch based on hands-on testing.

## Changes
- Flow parsed flags: positive green, negative red.
- NGS parsed flags: positive mutation red, tested/not-detected grey.
- Quick Import marrow fields clear automatically only after successful confirmation.
- Diagnostic marrow date auto-populates AML diagnosis date.
- Diagnosis date remains manually overridable, with visible source/override status.
- "Other secondary AML" renamed to "Other antecedent hematologic disorder" with optional note.
- Manual marrow entry is now a fillable editor rather than prompt-by-prompt dialogs.
- The same marrow editor is used for editing existing marrows.
- Treatment-cycle, VEN-start, and VEN-final-dose dates use native calendar date inputs.
- HMA defaults to AZA 7/7 days, decitabine 5/5 days, and oral decitabine/cedazuridine 5/5 days (planned/received).
- VEN defaults to planned/received 28/28 days.
- VEN final-dose date auto-calculates from VEN start, days received, and held days.
- Treatment delay is Yes/No; manual "days delayed" was removed.
- Delay reasons are multi-select.
- Planned vs actual HMA/VEN differences are visually flagged.
- Marrow headline displays "Blasts" with the selected source in parentheses.
- Subsequent treatment category is optional and simplified; alloHSCT remains captured separately.

## Safety
FAKE / DE-IDENTIFIED TEST DATA ONLY. This static GitHub prototype is not an approved research database.

## Validation
The blast-source selection logic, ELN risk/response algorithms, and report parsers are prototype workflow logic and require formal validation before production use.
