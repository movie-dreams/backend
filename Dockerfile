# ================== BUILD ==================
FROM node:24.15.0-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build \
    && npm prune --omit=dev

# ================== RUNTIME ==================
FROM node:24.15.0-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

RUN apk add --no-cache postgresql-client \
    && mkdir -p /app/estatico/imagenes \
    && chown -R node:node /app

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

COPY --chown=node:node --chmod=775 ./estatico/imagenes ./estatico/imagenes
COPY --chown=node:node ./migrations ./migrations
COPY --chown=node:node ./docker ./docker

RUN chmod +x /app/docker/entrypoint.sh /app/docker/migrate.sh

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:3000/documentacion-json').then(res => res.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

ENTRYPOINT ["/app/docker/entrypoint.sh"]
