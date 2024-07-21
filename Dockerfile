FROM node:20-slim AS base

LABEL maintainer="Dennis Kasper <denniskasper.com>"

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

RUN useradd -ms /bin/sh -u 1001 app
USER app

WORKDIR /app

COPY --chown=app:app package.json pnpm-lock.yaml ./

ENV NODE_ENV production


FROM base AS dev

ENV NODE_ENV development

COPY --chown=app:app . /app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

EXPOSE 4321
CMD ["pnpm", "dev-watch"]


FROM base AS build

COPY --chown=app:app . /app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile
RUN pnpm build


FROM nginx:alpine AS runtime

COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
