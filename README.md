# denniskasper.com

[![Deploy](https://github.com/DennisKasper/denniskasper.com/actions/workflows/build-deploy.yaml/badge.svg)](https://github.com/DennisKasper/denniskasper.com/actions/workflows/build-deploy.yaml)

My personal homepage.

## getting started

**Requirements:** Docker, Docker Compose, Node.js

Local development

```console
pnpm install
pnpm dev
```

or using docker compose

```console
make watch
```

Building the production image

```console
make build-prod
```

Remove everything

```console
make destroy
```

## running tests

Ensure Playwright browsers are installed

```console
pnpm exec playwright install
```

Run tests locally

```console
pnpm pw:test
```

## stack

[astro](https://astro.build/)  
[tailwindcss](https://tailwindcss.com/)

## icons

[iconify](https://iconify.design/)
