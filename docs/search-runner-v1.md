# Meridian Search Runner V1

## Configuration

The first provider adapter uses the Brave Web Search API. Configure these server-only variables locally and in Vercel:

```text
SEARCH_PROVIDER=brave
BRAVE_SEARCH_API_KEY=your_server_only_key
```

If the variables are absent, `/admin/medtech` displays `SEARCH PROVIDER NOT CONFIGURED`, disables search execution, and keeps manual URL retrieval available.

## Operator workflow

1. Open `/admin/medtech`.
2. Select a stored Product Profile QueryPlan.
3. Run the Chinese-language search.
4. Review Meridian-ranked candidates. Search snippets are not evidence.
5. Open or fetch one intentionally selected page.
6. Review the extracted text and edit the deterministic suggested sentence if one is shown.
7. Save a bounded fact as evidence.
8. Use evidence IDs to create a Regulatory Match or Opportunity candidate.

## Search coverage

Each run stores its query, provider, timing, result count, official-source count, fetched-page count, evidence count, failures and errors. These figures mean `searched`, not `complete coverage of China`.

## Benchmark

For each medtech fixture, the admin benchmark control runs three stored QueryPlans:

- `FIND_REGULATION`
- `DISCOVER_DISTRIBUTORS`
- `FIND_TENDERS`

This makes three real provider requests. It is disabled until a provider credential is configured. Fixture-only output must never be reported as a live benchmark result.

