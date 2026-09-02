# Meridian medtech intelligence benchmarks

These fixtures validate the product-understanding and query-planning architecture. They contain human-supplied product facts and Chinese terminology only. They do not contain companies, regulatory conclusions, tenders, standards, certifications, or other fabricated live results.

## Benchmark 1 — Portable wireless EEG

Goal: find China distributors while mapping the product's regulatory context.

Expected architecture checks:

1. A structured Product Profile retains intended use, clinical users, target buyers and China objective.
2. Human-supplied Chinese product, distributor, procurement and regulatory terms remain distinguishable from generated terms.
3. The planner creates all eight supported search intents.
4. Official regulatory sources receive priority for classification, regulation and standards.
5. Distributor and tender queries use China-specific commercial language.
6. No company or regulatory conclusion is created without stored evidence.
7. A reviewed opportunity can enter the existing partner pipeline.
8. A local-verification request inherits product and opportunity context.

## Benchmark 2 — Portable rehabilitation device

Goal: find China distributors using the same architecture without EEG-specific logic.

The same checks apply. This fixture uses rehabilitation-specific product and procurement terminology and verifies that query intent coverage and source priority remain stable.

## Deterministic result

Both fixtures currently pass five non-network checks:

- complete structured profile input;
- eight query intents generated;
- Chinese-language queries generated from supplied terms;
- authoritative sources prioritized for regulation;
- distributor discovery prioritized for the commercial goal.

Live retrieval results are intentionally excluded from the fixture. A benchmark becomes a live evidence test only after an operator retrieves and confirms real source pages in the Medtech Workflow.

