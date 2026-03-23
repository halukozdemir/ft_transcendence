#!/bin/bash
set -e

echo "⏳ Waiting for database..."
while ! python -c "
import psycopg2, os
psycopg2.connect(
    dbname=os.environ['POSTGRES_DB'],
    user=os.environ['POSTGRES_USER'],
    password=os.environ['POSTGRES_PASSWORD'],
    host=os.environ['POSTGRES_HOST'],
    port=os.environ['POSTGRES_PORT']
)" 2>/dev/null; do
    sleep 1
done
echo "✅ Database is ready!"

echo "Creating auth_app migrations..."
python manage.py makemigrations auth_app --noinput

echo "🔄 Running migrations..."
python manage.py migrate --noinput

echo "📦 Collecting static files..."
python manage.py collectstatic --noinput 2>/dev/null || true

echo "🚀 Starting Auth Service..."
exec "$@"
