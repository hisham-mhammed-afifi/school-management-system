FROM node:24-alpine AS base
WORKDIR /app

# ---- Dependencies (production only) ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- Build ----
FROM base AS build
COPY package.json package-lock.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Production ----
FROM base AS production
ENV NODE_ENV=production
RUN apk add --no-cache dumb-init
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY package.json ./

EXPOSE 3000
USER node
# dumb-init ensures SIGTERM is forwarded properly for graceful shutdown
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
