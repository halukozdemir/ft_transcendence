#!/bin/bash
# ============================================
# Generate self-signed SSL certificate
# for local development
# ============================================

SSL_DIR="$(dirname "$0")/ssl"
mkdir -p "$SSL_DIR"

if [ -f "$SSL_DIR/server.crt" ] && [ -f "$SSL_DIR/server.key" ]; then
    echo "✅ SSL certificates already exist in $SSL_DIR"
    echo "   Delete them and re-run this script to regenerate."
    exit 0
fi

echo "🔐 Generating self-signed SSL certificate..."

openssl req -x509 -nodes \
    -days 365 \
    -newkey rsa:2048 \
    -keyout "$SSL_DIR/server.key" \
    -out "$SSL_DIR/server.crt" \
    -subj "/C=TR/ST=Istanbul/L=Istanbul/O=42/OU=ft_transcendence/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

chmod 600 "$SSL_DIR/server.key"
chmod 644 "$SSL_DIR/server.crt"

echo "✅ SSL certificates generated successfully!"
echo "   Certificate: $SSL_DIR/server.crt"
echo "   Private Key: $SSL_DIR/server.key"
