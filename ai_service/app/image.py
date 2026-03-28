from io import BytesIO
from PIL import Image

_pipeline = None
NSFW_THRESHOLD = 0.7


def _get_pipeline():
    global _pipeline
    if _pipeline is None:
        from transformers import pipeline
        _pipeline = pipeline(
            "image-classification",
            model="Falconsai/nsfw_image_detection",
        )
    return _pipeline


def check_image(file_bytes: bytes) -> dict:
    try:
        img = Image.open(BytesIO(file_bytes)).convert("RGB")
    except Exception:
        return {
            "safe": False,
            "nsfw_score": 1.0,
            "label": "invalid_image",
            "error": "Could not process image",
        }

    results = _get_pipeline()(img)

    scores = {r["label"]: r["score"] for r in results}
    nsfw_score = scores.get("nsfw", 0.0)
    normal_score = scores.get("normal", 0.0)

    return {
        "safe": nsfw_score < NSFW_THRESHOLD,
        "nsfw_score": round(nsfw_score, 4),
        "normal_score": round(normal_score, 4),
        "label": "nsfw" if nsfw_score >= NSFW_THRESHOLD else "normal",
    }
