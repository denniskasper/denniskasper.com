# denniskasper.com

My personal homepage.

## getting started

**Requirements:** Node.js, pnpm, Docker (optional)

Local development

```console
pnpm install
pnpm dev
```

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

## deployment

Deployed by [Dokploy](https://dokploy.com/) — push to `main` auto-builds and redeploys. Server, deploy tunnel, and DNS are documented in the [denniskasper.dev](https://github.com/denniskasper/denniskasper.dev) repo.
