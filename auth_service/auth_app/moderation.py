import requests
from django.conf import settings

AI_SERVICE_URL = getattr(settings, 'AI_SERVICE_URL', 'http://ai_service:8002/api/ai')
TIMEOUT = 10


def check_avatar_safety(image_file) -> dict:
    """Call AI service to check image for NSFW content. Fail-closed on errors."""
    try:
        image_file.seek(0)
        resp = requests.post(
            f"{AI_SERVICE_URL}/moderate/image",
            files={"file": (image_file.name, image_file, image_file.content_type)},
            timeout=TIMEOUT,
        )
        resp.raise_for_status()
        return resp.json()
    except Exception:
        return {"safe": False, "nsfw_score": 0.0, "label": "service_unavailable"}
