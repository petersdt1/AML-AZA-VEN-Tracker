# V2.10 regression checklist

V2.8 is the frozen UI baseline for V2.9.

## Required UI
- Quick Import
- Baseline
- Treatment Cycles
- Bone Marrows
- CBC Trend
- Outcomes
- Timeline / QA
- Export
- Manual marrow add/edit/delete
- Structured data review
- Raw source review
- Flow, NGS, conventional cytogenetics, FISH, MRD editors
- JSON and CSV exports
- Permanent HMA/VEN discontinuation fields

## Permanent parser fixture
For the diagnostic AML marrow used during V2.8 QI, expected structured results include:
- aspirate blasts 3.5%
- flow blasts 30%
- IHC 20-25%
- flow preferred when adequate
- TP53 p.(G244S), VAF 43.05%
- TP53 p.(P151S), VAF 39.55%
- EZH2 p.(M24T), VAF 48.57%, VUS
- FISH del(5q) positive
- FISH del(20q12) positive
- three copies RUNX1 positive
- FISH t(8;21) negative and never a positive cyto hit
- flow modifiers remain attached only to their own markers


## V2.10 additions
- PB blast status defaults to Unknown unless explicitly supported by source.
- Explicit PB blast percentage is retained.
- EMD defaults to Unknown.
- Aspirate adequacy is retained and affects source hierarchy.
- VUS remains in detailed NGS/export but is excluded from executive summary.
- Conventional cytogenetics appears in detailed marrow view.
- Raw cytogenetic/FISH observations remain preserved alongside canonical normalization.
