# ─────────────────────────────────────────────────────────────
# ForgeMind AI — Frontend Dockerfile
# ─────────────────────────────────────────────────────────────

# ─── Base ────────────────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app

# ─── Dependencies ────────────────────────────────────────────────
FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# ─── Development ─────────────────────────────────────────────────
FROM dependencies AS development
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ─── Build ───────────────────────────────────────────────────────
FROM dependencies AS builder
COPY . .
RUN npm run build

# ─── Production (nginx) ──────────────────────────────────────────
FROM nginx:1.25-alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.frontend.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
