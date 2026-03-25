FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml ./
COPY apps/mobile-h5/package.json ./apps/mobile-h5/package.json
RUN pnpm install --filter mobile-h5... --frozen-lockfile=false

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/mobile-h5/node_modules ./apps/mobile-h5/node_modules
COPY package.json pnpm-workspace.yaml ./
COPY apps/mobile-h5 ./apps/mobile-h5
WORKDIR /app/apps/mobile-h5
ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN pnpm build

FROM nginx:1.27-alpine AS runner
COPY deploy/nginx/mobile.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/mobile-h5/dist /usr/share/nginx/html
EXPOSE 80
