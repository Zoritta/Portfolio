# Build context is the repo root (npm workspaces monorepo — apps/api's package-lock.json lives
# there, not locally), so this is built with:
#   docker build -f apps/api/Dockerfile -t portfolio-api .

# ---- build: install all deps, generate the Prisma client, compile TypeScript ----
FROM node:22-alpine AS build
WORKDIR /app

# Prisma's query engine needs OpenSSL present, even on Alpine's musl libc.
RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
RUN npm ci --workspace=apps/api --include-workspace-root

COPY apps/api apps/api
# Must run before the TypeScript build: our source imports types from the generated Prisma client
# (e.g. `Prisma.InputJsonValue`), which don't exist until this has run at least once.
RUN npm exec --workspace=apps/api -- prisma generate
RUN npm run build --workspace=apps/api

# ---- runtime: same base image as build (so the Prisma engine binary matches), minimal layers ----
FROM node:22-alpine AS runtime
WORKDIR /app

RUN apk add --no-cache openssl
ENV NODE_ENV=production

# Copies the full node_modules from the build stage (not a separately slimmed prod install) so the
# generated Prisma client — which was written into this exact node_modules tree — comes along intact.
# --chown=node:node so the non-root user below actually owns what it's reading.
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build --chown=node:node /app/apps/api/dist ./apps/api/dist
COPY --from=build --chown=node:node /app/apps/api/prisma ./apps/api/prisma
COPY --from=build --chown=node:node /app/apps/api/package.json ./apps/api/package.json

# Run as the non-root "node" user the base image ships with, rather than the default root — limits
# what a compromised process inside the container could do.
USER node

EXPOSE 3001
CMD ["node", "apps/api/dist/src/main"]
