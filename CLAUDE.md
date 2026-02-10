# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Local development (Node.js):**
```bash
pnpm install
pnpm dev
```

**Local development (Docker):**
```bash
make watch
```

**Build production:**
```bash
pnpm build
# or with Docker
make build-prod
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

**Docker operations:**
```bash
make build     # Build containers
make up        # Run containers
make down      # Stop containers
make destroy   # Remove all containers, images, and volumes
make logs      # View logs
```

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
