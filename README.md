# AML AZA/VEN Tracker V2.2

V2.2 incorporates the first hands-on QI pass.

## Major changes
- Diagnostic marrow is no longer scored as a treatment-response marrow.
- Marrow blast sources are captured separately:
  - flow cytometry
  - aspirate/manual differential
  - core/IHC estimate or range
- Automatic preferred-blast hierarchy with manual adjudication override.
- If the only IHC range crosses the 5% response threshold, automated response is held for adjudication.
- Post-treatment marrows use:
  - final ELN recovery window through the day before the next cycle when the next cycle is known
  - a clearly labeled provisional 14-day preview when no next cycle or terminal boundary is yet available
- Cycle dates use text entry that accepts MM/DD/YYYY or YYYY-MM-DD.
- VEN start defaults to cycle start.
- VEN days default to 28.
- VEN final-dose date auto-calculates from VEN days and held days.
- Manually changing the final-dose date recalculates VEN days.
- Restored cycle-level:
  - G-CSF
  - HMA planned/actual days
  - treatment delay
  - delay duration/reason
  - VEN interruption/held days
  - reason VEN shortened
  - cycle notes
- Duplicate same-date marrow workflow offers update-existing vs add-separate.
- Editing/deleting a marrow automatically recalculates timeline, response and relapse.
- QA now flags:
  - duplicate same-day marrows
  - implausible treatment dates
  - cycle before diagnosis
  - VEN date inconsistencies
  - diagnostic marrow after C1D1
  - missing response-window counts
- Pre-diagnosis CBCs display as Dx−N instead of Dx+-N.
- Multiple true marrows in one cycle remain supported.

## Safety
FAKE / DE-IDENTIFIED TEST DATA ONLY. This static GitHub prototype is not an approved research database.

## Validation
The blast-source selection logic, ELN risk/response algorithms, and report parsers are prototype workflow logic. They require formal validation against the governing source criteria and institutional research requirements before production use.
