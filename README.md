# AML AZA/VEN Tracker V3.2

V3.2 introduces the Smart Import architecture for heterogeneous marrow reports.

## Smart Import
- One unified free-text source box for mixed pathology, flow, cytogenetics, FISH, and molecular reports.
- Optional institution-hosted AI extraction endpoint using a strict observation-only JSON schema.
- No API key is stored or requested by the static page. The endpoint URL alone is stored locally.
- If no endpoint is configured, a local deterministic parser fallback builds a draft so the workflow can be tested now.
- A Copy AI extraction prompt + Manual AI JSON handoff provides an immediately testable bridge before a backend endpoint exists.
- Every extraction is converted into the existing structured BMBx schema, then reviewed in the same editable BMBx editor before saving.
- AI is explicitly prohibited from assigning ELN risk, response, complex karyotype, AML-MR status, or eligibility. Those remain deterministic app calculations.
- AI schema preserves Positive vs Negative FISH/rearrangement results and requires Unknown/null instead of unsupported inference.
- Explicit tested-gene coverage is distinct from detected variants; absence from a report is not interpreted as negative.
- Evidence snippets and extraction warnings are retained with the draft.
- AI/parser numeric disagreements are surfaced as review flags.
- The original unified source text is retained read-only in the structured editor for provenance.

## Existing workflows preserved
- CBC trend import remains deterministic.
- The prior segmented marrow import is retained under a collapsed Legacy parser fallback section.
- V3.1 localStorage migrates into V3.2.

This remains a de-identified prototype. Do not send PHI to an unapproved endpoint or public service.
