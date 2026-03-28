# ---------- AI Service (FastAPI + Uvicorn) ----------
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HF_HOME=/app/.cache/huggingface

WORKDIR /app

# Install system dependencies (for image processing)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gcc \
        libgl1 \
        libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Pre-download NSFW detection model so it works offline
RUN python -c "from transformers import pipeline; pipeline('image-classification', model='Falconsai/nsfw_image_detection')"

# Copy project
COPY . .

# Create non-root user
RUN addgroup --system app && \
    adduser --system --ingroup app app && \
    chown -R app:app /app

USER app

EXPOSE 8002

# Run with Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002", "--workers", "2"]
