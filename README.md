# denniskasper.com

![CI/CD](https://github.com/DennisKasper/denniskasper.com/actions/workflows/main.yml/badge.svg)

My personal homepage.

## getting started

Local development

```console
COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose -f docker-compose.yaml up --build
```

Building the image

```console
DOCKER_BUILDKIT=1 docker build --target runtime -t denniskasperdotcom .
```

## stack

[astro](https://astro.build/)  
[tailwindcss](https://tailwindcss.com/)

## icons

[iconify](https://iconify.design/)
