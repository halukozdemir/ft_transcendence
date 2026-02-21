from fastapi import FastAPI

app = FastAPI(title="ft_transcendence AI Service", root_path="/api/ai")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai"}


# TODO: POST /analyze/text  — metin analizi endpoint'i
# TODO: POST /analyze/image — görsel analizi endpoint'i
