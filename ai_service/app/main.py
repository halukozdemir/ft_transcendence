from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel

from .moderation import check_text
from .image import check_image

app = FastAPI(title="ft_transcendence AI Service", root_path="/api/ai")


class TextRequest(BaseModel):
    # Input contract for text moderation endpoint.
    text: str


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai"}


@app.post("/moderate/text")
async def moderate_text(req: TextRequest):
    # Return original + censored text so callers can audit moderation decisions.
    result = check_text(req.text)
    return result


@app.post("/moderate/image")
async def moderate_image(file: UploadFile = File(...)):
    # Read binary payload fully before forwarding to image moderation pipeline.
    contents = await file.read()
    result = check_image(contents)
    return result
