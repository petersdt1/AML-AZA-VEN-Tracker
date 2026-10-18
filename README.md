# AML AZA/VEN Tracker V2.1

V2.1 changes:
- Epic block-style CBC parser preserving date + time
- Recognizes automated ANC and manual-differential ANC labels
- Allows platelet-only / ANC-only observations
- Manual add/edit/delete for CBC observations
- Manual add/edit/delete for bone marrows
- Delete-cycle button with automatic renumbering
- VEN start defaults to cycle day 1 but remains editable
- ELN hematologic recovery window uses marrow date through the day before the next treatment cycle (or terminal boundary if no next cycle)
- Best ANC and platelet in the recovery window are selected independently
- Manual count overrides retained
- Calculated marrow response shown longitudinally
- Automatic relapse-date candidate after prior CR/CRh/CRi when first later marrow shows >=5% blasts
- Relapse date/basis remain manually overridable
- Timeline and QA recalculate automatically

Important:
- FAKE / DE-IDENTIFIED TEST DATA ONLY.
- This GitHub prototype is not an approved research database.
- ELN risk/response logic and all source-text parsers require formal validation before production use.
