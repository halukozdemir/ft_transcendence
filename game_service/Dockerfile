# ---------- Game Service (Node.js + Express + Socket.io) ----------
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Copy project
COPY . .

# Create non-root user
RUN addgroup -S app && \
    adduser -S app -G app && \
    chown -R app:app /app

USER app

EXPOSE 8001

CMD ["node", "server.js"]
