# Tajseer Knowledge Weave

A bilingual, cinematic website for Tajseer that connects its five educational technology services through an interactive Knowledge Weave experience.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/tajseer-knowledge-weave/src/App.tsx` — single-page bilingual experience, service content, navigation, and weave visuals
- `artifacts/tajseer-knowledge-weave/src/index.css` — visual system, responsive behavior, motion and reduced-motion rules
- `artifacts/tajseer-knowledge-weave/public/assets/tajseer/` — unchanged supplied Tajseer logo, favicon, and service artwork
- `artifacts/tajseer-knowledge-weave/reference/` — source context and approved creative direction used for the build
- `artifacts/tajseer-knowledge-weave/.replit-artifact/artifact.toml` — artifact routing and managed web workflow

## Architecture decisions

- The first build is presentation-first and frontend-only; the API server remains available for future integrations but is not required by this experience.
- The Knowledge Weave uses SVG/CSS 2.5D geometry and live HTML text so the concept remains lightweight, accessible, and understandable without WebGL.
- The original supplied logo artwork is used directly and is never redrawn, distorted, or mirrored; the Arabic lockup is selected in RTL mode.
- Service content is source-backed and presented as five immersive chapters rather than a standard card grid.
- Arabic and English share the same content model but receive independent direction, typography, navigation cues, and spacing.

## Product

- Visitors can explore Tajseer’s five service areas through a scroll-linked visual narrative.
- Visitors can switch between English LTR and Arabic RTL while preserving the same factual content and direct contact channels.
- Visitors can jump independently to Overview, Services, About, and Contact using persistent navigation and chapter progress controls.
- Visitors can access the published Riyadh location, telephone numbers, and email address.

## User preferences

- Keep the Knowledge Weave as the single dominant metaphor; do not merge it into the other rejected creative directions.
- Preserve a premium, cinematic, spatial, custom-built feel without generic SaaS, neon, glassmorphism, or unsupported business claims.

## Gotchas

- The published contact values and 2009 history statement come from the supplied archive and still require business confirmation before final publication.
- Keep essential content in HTML; visual motifs and supplied service art are supporting references, not evidence of client work.
- The artifact workflow supplies `PORT` and `BASE_PATH`; use the managed workflow rather than starting the Vite server manually.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
