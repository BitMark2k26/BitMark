from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.server import router 
import os
app = FastAPI(title="PageIndex Vectorless RAG")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(router,prefix="/api")