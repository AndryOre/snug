# Build context is the repo root: docker build -f apps/site/Dockerfile .
# The context has no .git, so sitemap lastmod dates come in as a build argument:
#   --build-arg LAST_MODIFIED_DATES="$(bash apps/site/docker/last-modified.sh)"
# Without it the sitemap omits lastmod.
FROM oven/bun:1.4.2-alpine AS build
WORKDIR /repo

COPY package.json bun.lock bunfig.toml tsconfig.base.json ./
COPY apps/site/package.json apps/site/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN bun install --frozen-lockfile --filter @snug/site --ignore-scripts

COPY packages/ui packages/ui
COPY apps/site apps/site
COPY PRIVACY_POLICY.md PRIVACY_POLICY.md
ARG LAST_MODIFIED_DATES=""
RUN bun run --cwd apps/site build
RUN bun run --cwd apps/site src/scripts/render-security-headers.ts dist docker/security-headers.conf dist-security-headers.conf

FROM nginx:1.29-alpine
RUN rm -f /etc/nginx/conf.d/default.conf
COPY apps/site/docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /repo/apps/site/dist-security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY apps/site/docker/site.conf /etc/nginx/conf.d/site.conf
COPY --from=build /repo/apps/site/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO /dev/null http://127.0.0.1/ || exit 1
