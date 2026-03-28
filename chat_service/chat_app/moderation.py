import httpx
from django.conf import settings

AI_SERVICE_URL = getattr(
    settings, 'AI_SERVICE_URL', 'http://ai_service:8002/api/ai'
)
TIMEOUT = 3.0


async def moderate_text(text: str) -> dict:
    """Call AI service to check text for profanity. Fail-open on errors."""
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.post(
                f"{AI_SERVICE_URL}/moderate/text",
                json={"text": text},
            )
            resp.raise_for_status()
            return resp.json()
    except Exception:
        return {"flagged": False, "original": text, "censored": text}


def moderate_text_sync(text: str) -> dict:
    """Synchronous version for DRF views. Fail-open on errors."""
    try:
        resp = httpx.post(
            f"{AI_SERVICE_URL}/moderate/text",
            json={"text": text},
            timeout=TIMEOUT,
        )
        resp.raise_for_status()
        return resp.json()
    except Exception:
        return {"flagged": False, "original": text, "censored": text}
