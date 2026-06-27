from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat, expenses, anomalies, ocr
from db.database import init_db

app = FastAPI(title="FinPilot AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await init_db()

app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(expenses.router, prefix="/api/expenses", tags=["Expenses"])
app.include_router(anomalies.router, prefix="/api/anomalies", tags=["Anomalies"])
app.include_router(ocr.router, prefix="/api/ocr", tags=["OCR"])

@app.get("/")
def root():
    return {"message": "FinPilot AI Backend Running"}
