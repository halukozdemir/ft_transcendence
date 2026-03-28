import io
from PIL import Image
from app.image import check_image


def _make_solid_image(color=(0, 128, 0), size=(64, 64)) -> bytes:
    img = Image.new("RGB", size, color)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


class TestImageModeration:
    def test_normal_image_is_safe(self):
        img_bytes = _make_solid_image(color=(0, 128, 0))
        result = check_image(img_bytes)
        assert result["safe"] is True
        assert result["label"] == "normal"

    def test_response_has_required_fields(self):
        img_bytes = _make_solid_image()
        result = check_image(img_bytes)
        assert "safe" in result
        assert "nsfw_score" in result
        assert "label" in result

    def test_nsfw_score_is_float(self):
        img_bytes = _make_solid_image()
        result = check_image(img_bytes)
        assert isinstance(result["nsfw_score"], float)
        assert 0.0 <= result["nsfw_score"] <= 1.0

    def test_invalid_bytes_returns_error(self):
        result = check_image(b"not an image at all")
        assert result["safe"] is False
        assert result["label"] == "invalid_image"

    def test_empty_bytes_returns_error(self):
        result = check_image(b"")
        assert result["safe"] is False
        assert result["label"] == "invalid_image"
