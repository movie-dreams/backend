# ================== CONSTRUCCION DE DESARROLLO ==================
FROM node:24.15.0-alpine as build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build \
    && npm prune --omit=dev

# ================== CONSTRUCCION DE PRODUCCION ==================

FROM node:24.15.0-alpine as production

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

COPY --chown=node:node --chmod=775 ./estatico/imagenes ./estatico/imagenes

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD node -e "fetch('http://localhost:3000/documentacion-json').then(res => res.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "dist/main.js"]