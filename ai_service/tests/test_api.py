import io
import pytest
from PIL import Image
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.mark.anyio
async def test_health(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["service"] == "ai"


@pytest.mark.anyio
async def test_moderate_text_clean(client):
    resp = await client.post("/moderate/text", json={"text": "hello world"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["flagged"] is False


@pytest.mark.anyio
async def test_moderate_text_profanity(client):
    resp = await client.post("/moderate/text", json={"text": "what the fuck"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["flagged"] is True


@pytest.mark.anyio
async def test_moderate_text_empty_body(client):
    resp = await client.post("/moderate/text", json={})
    assert resp.status_code == 422


@pytest.mark.anyio
async def test_moderate_image_valid(client):
    img = Image.new("RGB", (64, 64), (0, 128, 0))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    resp = await client.post(
        "/moderate/image",
        files={"file": ("test.png", buf, "image/png")},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "safe" in data
    assert "nsfw_score" in data


@pytest.mark.anyio
async def test_moderate_image_no_file(client):
    resp = await client.post("/moderate/image")
    assert resp.status_code == 422
