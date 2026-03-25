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
COPY --from=deps /app/apps/admin-web/node_modules ./apps/admin-web/node_modules
COPY package.json pnpm-workspace.yaml ./
COPY apps/admin-web ./apps/admin-web
WORKDIR /app/apps/admin-web
ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN pnpm build

FROM nginx:1.27-alpine AS runner
COPY deploy/nginx/admin.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/admin-web/dist /usr/share/nginx/html
EXPOSE 80
