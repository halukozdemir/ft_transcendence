# ---------- Chat Service (Django Channels + Daphne) ----------
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gcc \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Create non-root user
RUN addgroup --system app && \
    adduser --system --ingroup app app && \
    chown -R app:app /app

USER app

EXPOSE 8003

# Run with Daphne (ASGI server for WebSocket support)
CMD ["daphne", "-b", "0.0.0.0", "-p", "8003", "chat_project.asgi:application"]
