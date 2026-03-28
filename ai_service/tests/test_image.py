import io
from pathlib import Path
from PIL import Image
from app.image import check_image

FIXTURES_DIR = Path(__file__).parent / "fixtures"


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

    def test_normal_image_has_low_nsfw_score(self):
        img_bytes = _make_solid_image(color=(0, 128, 0))
        result = check_image(img_bytes)
        assert result["nsfw_score"] < 0.3

    def test_skin_tone_image_is_still_safe(self):
        img_bytes = _make_solid_image(color=(210, 160, 130))
        result = check_image(img_bytes)
        assert result["safe"] is True

    def test_threshold_boundary(self):
        """Verify the 0.7 threshold is applied correctly."""
        from app.image import NSFW_THRESHOLD
        assert NSFW_THRESHOLD == 0.7
        img_bytes = _make_solid_image()
        result = check_image(img_bytes)
        if result["nsfw_score"] < NSFW_THRESHOLD:
            assert result["safe"] is True
        else:
            assert result["safe"] is False

    def test_different_image_sizes(self):
        for size in [(32, 32), (128, 128), (256, 256)]:
            img_bytes = _make_solid_image(size=size)
            result = check_image(img_bytes)
            assert result["safe"] is True
            assert "nsfw_score" in result


class TestFixtureImages:
    """Tests using real images from tests/fixtures/ directory.
    Place NSFW test images in ai_service/tests/fixtures/ to run these.
    Safe images: safe_*.jpg/png  |  NSFW images: nsfw_*.jpg/png
    """

    def _get_fixtures(self, prefix: str) -> list[Path]:
        if not FIXTURES_DIR.exists():
            return []
        return sorted(
            p for p in FIXTURES_DIR.iterdir()
            if p.name.startswith(prefix) and p.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp")
        )

    def test_safe_fixtures_are_safe(self):
        files = self._get_fixtures("safe_")
        if not files:
            return
        for f in files:
            result = check_image(f.read_bytes())
            assert result["safe"] is True, f"{f.name} should be safe but got nsfw_score={result['nsfw_score']}"

    def test_nsfw_fixtures_are_flagged(self):
        files = self._get_fixtures("nsfw_")
        if not files:
            return
        for f in files:
            result = check_image(f.read_bytes())
            assert result["safe"] is False, f"{f.name} should be flagged but got nsfw_score={result['nsfw_score']}"
            assert result["nsfw_score"] >= 0.7
