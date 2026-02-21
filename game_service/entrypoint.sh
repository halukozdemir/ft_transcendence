#!/bin/bash
set -e

echo "⏳ Waiting for database..."
while ! python -c "
import psycopg2, os
psycopg2.connect(
    dbname=os.environ['POSTGRES_STATS_DB'],
    user=os.environ['POSTGRES_STATS_USER'],
    password=os.environ['POSTGRES_STATS_PASSWORD'],
    host=os.environ['POSTGRES_STATS_HOST'],
    port=os.environ['POSTGRES_STATS_PORT']
)" 2>/dev/null; do
    sleep 1
done
echo "✅ Database is ready!"

echo "⏳ Waiting for Redis..."
while ! python -c "
import redis, os
r = redis.Redis(
    host=os.environ.get('REDIS_HOST', 'redis_broker'),
    port=int(os.environ.get('REDIS_PORT', 6379)),
    password=os.environ.get('REDIS_PASSWORD', '')
)
r.ping()
" 2>/dev/null; do
    sleep 1
done
echo "✅ Redis is ready!"

echo "🔄 Running migrations..."
python manage.py migrate --noinput

echo "🚀 Starting Game Service..."
exec "$@"
