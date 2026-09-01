# Yifan Fu — Personal Website

A production-ready personal brand and China market advisory website built with Next.js, TypeScript, Tailwind CSS, and Motion.

## Editing content

Personal details and advisory copy live in `src/content/site.ts`. China Desk product copy lives in `src/content/china-desk.ts`, and all dashboard sample content lives in `src/data/china-desk-demo.ts`.

## Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production

```bash
pnpm build
pnpm start
```

The project exports a static site and can be deployed directly to Vercel using the included configuration.

## CHINA DESK — FUTURE ROADMAP

The current China Desk dashboard is a typed front-end demo. It intentionally contains no authentication, billing, database, AI calls, live feeds, or automated outreach. A validated product could later add these capabilities behind the existing interfaces:

- **Authentication:** Clerk or Supabase Auth for private client workspaces.
- **Database:** Postgres or Supabase for organizations, research, requests, competitors, partners, and accumulated context.
- **Billing:** Stripe for recurring subscriptions after packaging and pricing are validated.
- **AI:** OpenAI API for assisted research synthesis and question routing, with explicit source handling and human review.
- **Knowledge retrieval:** Vector embeddings and retrieval-augmented generation over approved client context and research.
- **Research storage:** Postgres metadata plus object storage for reports, source files, and working documents.
- **Notifications:** Email updates for market developments, completed research, and request activity.

The typed structures in `src/data/china-desk-demo.ts` are designed to be replaced by API-backed data without rebuilding the dashboard UI.
