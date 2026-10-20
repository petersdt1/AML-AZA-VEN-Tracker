# AML AZA/VEN Tracker V3.0

Major V3.0 changes:
- Chronology-derived cycle numbering with stable IDs.
- Collapsible cycle cards with expand/collapse all.
- Chronology-derived BMBx numbering and collapsible BMBx cards.
- Response CBC candidate selectors for ANC and platelets, independently selectable.
- Adequate aspirate morphology prioritized over flow for response blast enumeration; limited aspirates trigger fallback/adjudication.
- ELN 2022 risk now incorporates cytogenetics and FLT3-ITD/NPM1 interactions.
- FLT3-ITD and FLT3-TKD tracked separately in a key molecular marker-status table.
- ELN 2024 Less-Intensive calculated independently and marked Not applicable after prior HMA.
- PR with missing counts now returns Pending count recovery data.
- MLFS included as prior remission state for morphologic relapse surveillance.
- Structured MRD numeric %, assay LOD/sensitivity %, specimen, and local/central lab.
- Safer rendering of cycle notes/reasons.
- Local calendar arithmetic avoids UTC date-shift behavior.
- Terminal cycles display a provisional 28-day derived end when no later cycle is entered.
- V2.10 localStorage is accepted as a migration fallback.

This remains a de-identified workflow prototype and is not a PHI-ready production database.
