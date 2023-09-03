FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY package.json pnpm-lock.yaml /app/
WORKDIR /app

FROM base AS dev
ENV NODE_ENV=development
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
EXPOSE 4321
CMD ["pnpm", "dev-compose"]

FROM base AS build
ENV NODE_ENV=production
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY . /app
RUN pnpm build

FROM nginx:alpine AS runtime
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
