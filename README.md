# AML AZA/VEN Tracker V3.1

Clinical-logic hardening release.

- Blast hierarchy: manual adjudication → adequate aspirate → adequate flow → core/IHC → limited aspirate.
- Raw cytogenetic/FISH text cannot directly drive ELN risk.
- ELN 2022 consumes only structured Present/Positive observations.
- RUNX1 copy gain is distinct from RUNX1::RUNX1T1.
- Negative FISH cannot trigger favorable/adverse risk.
- ELN 2022 now returns an auditable evidence trace.
- TP53 VAF ≥10%, NPM1 + adverse cytogenetics, CBF AML, CEBPA-bZIP, t(9;11), adverse cytogenetics, MR genes, and FLT3-ITD have explicit branches.
- ELN 2024 Less-Intensive is isolated from ELN 2022 and uses prior HMA, TP53, DDX41, FLT3-ITD, NRAS, and KRAS only.
- Unknown required assay status propagates to Unable to determine.
- DDX41 is shown in the key molecular marker table.

De-identified prototype only; not a PHI-ready production database.
