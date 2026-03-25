FROM node:20-alpine AS base
RUN npm install -g pnpm@9.0.0
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml ./
COPY server/package.json ./server/package.json
COPY apps/admin-web/package.json ./apps/admin-web/package.json
COPY apps/mobile-h5/package.json ./apps/mobile-h5/package.json
RUN pnpm install --frozen-lockfile=false

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY package.json pnpm-workspace.yaml ./
COPY server ./server
WORKDIR /app/server
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app/server
ENV NODE_ENV=production
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/server/node_modules ./node_modules
COPY --from=build /app/server/package.json ./package.json
COPY --from=build /app/server/dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
