from fastapi import FastAPI
from app.routes import router

app = FastAPI(
    title="CyberCSI Backend",
    version="1.0.0"
)

app.include_router(router)

@app.get("/health")
def health():
    return {
        "status": "ok"
    }
