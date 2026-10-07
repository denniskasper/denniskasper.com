# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

## Development Commands

**Local development (Node.js):**
```bash
pnpm install
pnpm dev
```

**Build production:**
```bash
pnpm build
```

**Testing:**
```bash
# Install Playwright browsers first
pnpm exec playwright install

# Run tests
pnpm build && pnpm pw:test

# Interactive test UI
pnpm pw:ui
```

## Deployment

Production (`https://denniskasper.com`) runs on **Cloudflare Workers** as a static-assets Worker. Push to `main` → Cloudflare Workers Builds runs `pnpm build` and `wrangler deploy`. `wrangler.jsonc` holds the config: there is no `main` entry point, Cloudflare serves `./dist` directly, misses fall through to the Astro-generated `404.html`, and `workers_dev` is off so the site is reachable only on the custom domain.

## Architecture

This is a personal homepage built with Astro and TailwindCSS. The architecture is straightforward:

- **Astro**: Static site generator with component-based architecture
- **TailwindCSS**: Utility-first CSS framework for styling
- **Playwright**: End-to-end testing framework

**Key directories:**
- `src/components/`: Reusable Astro components (nav-link, nav-social)
- `src/layouts/`: Base layout template with header, footer, and theme switching
- `src/pages/`: Route pages (index, 404, resume)
- `public/`: Static assets (icons, resume PDF, global CSS)
- `scripts/`: Build scripts (fetch-resume.ts)
- `tests/`: Playwright test specifications

**Resume Fetching:**
The resume page (`src/pages/resume.md`) and PDF (`public/resume.pdf`) are generated at build time by `scripts/fetch-resume.ts`, which pulls content from the [denniskasper/resume](https://github.com/denniskasper/resume) repo. Both files are gitignored. The script runs automatically as a `prebuild`/`predev` hook.

**Theme System:**
The site implements a dark/light theme toggle using:
- TailwindCSS dark mode classes
- Local storage for persistence (with user consent banner)
- Client-side JavaScript in the layout for theme switching logic

**Import Aliases:**
- `@components/*` → `src/components/*`
- `@layouts/*` → `src/layouts/*`

## Agent skills

### Issue tracker

Issues and specs live as GitHub issues in `denniskasper/denniskasper.com` (via the `gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
