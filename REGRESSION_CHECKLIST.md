# V3.2 Regression Checklist

## Smart Import
- Unified source text can build a local-parser draft with no endpoint configured.
- AI JSON handoff validates and maps into the same draft schema.
- Endpoint response may be direct JSON or wrapped in `data` / `extraction`.
- Unknown fields remain Unknown/null.
- Tested genes are converted to Negative only when explicitly listed as assayed and no positive variant is present.
- FISH Negative remains Negative.
- RUNX1 copy gain stays distinct from RUNX1::RUNX1T1.
- AI/parser blast disagreements surface as review flags.
- Review Smart Import draft opens the standard structured BMBx editor.
- Saving a Smart Import draft preserves original unified raw source and extraction provenance.
- Legacy segmented import still functions.
- CBC parser remains unchanged.

## Clinical calculation separation
- Smart Import never directly sets ELN risk, response, complex karyotype, AML-MR, or eligibility.
- V3.1 ELN and blast hierarchy regression behavior remains unchanged.
