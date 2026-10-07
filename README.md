# denniskasper.com

My personal homepage, live at [denniskasper.com](https://denniskasper.com).

## getting started

**Requirements:** Node.js 24 (pinned in `.node-version`), pnpm

Local development

```console
pnpm install
pnpm dev
```

The dev server runs at `http://localhost:4321`.

## resume

The resume page and PDF are not stored in this repo. `pnpm dev` and `pnpm build` fetch them from [denniskasper/resume](https://github.com/denniskasper/resume) first, writing `src/pages/resume.md` and `public/resume.pdf` (both gitignored).

## running tests

Ensure Playwright browsers are installed

```console
pnpm exec playwright install
```

Build the project and run tests

```console
pnpm build
pnpm pw:test
```

## stack

[astro](https://astro.build/)  
[tailwindcss](https://tailwindcss.com/)  
[playwright](https://playwright.dev/)  
[cloudflare workers](https://developers.cloudflare.com/workers/static-assets/)

## deployment

Deployed on [Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/) as static assets — push to `main` builds and redeploys. Config lives in `wrangler.jsonc`.
