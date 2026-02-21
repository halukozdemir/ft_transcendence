# ---------- Gateway (Nginx reverse proxy) ----------
# Lightweight image, only serves config + certs
FROM nginx:1.25-alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom gateway config
COPY nginx.conf /etc/nginx/nginx.conf

# SSL certificates will be mounted via volume
RUN mkdir -p /etc/nginx/ssl

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
