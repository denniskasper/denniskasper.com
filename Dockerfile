FROM node:24-slim AS base

LABEL maintainer="Dennis Kasper <denniskasper.com>"

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

RUN useradd -ms /bin/sh -u 1001 app
USER app

WORKDIR /app

COPY --chown=app:app package.json pnpm-lock.yaml ./


FROM base AS dev

ENV NODE_ENV=development

COPY --chown=app:app . /app

RUN --mount=type=cache,id=pnpm,uid=1001,gid=1001,target=/pnpm/store pnpm install --frozen-lockfile

EXPOSE 4321
CMD ["pnpm", "dev-watch"]


FROM base AS build

ENV NODE_ENV=production

COPY --chown=app:app . /app

RUN --mount=type=cache,id=pnpm,uid=1001,gid=1001,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm build


FROM nginxinc/nginx-unprivileged:1.28-alpine AS runtime

COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO /dev/null http://localhost:8080/ || exit 1
