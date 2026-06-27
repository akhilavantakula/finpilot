from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from db.database import get_db
from services.gemini_service import chat_with_rag, seed_knowledge_base
from typing import List

router = APIRouter()

class ChatMessage(BaseModel):
    message: str
    history: List[dict] = []

@router.post("/")
async def chat(payload: ChatMessage, db: AsyncSession = Depends(get_db)):
    await seed_knowledge_base()
    
    response = await chat_with_rag(payload.message, payload.history)
    
    # Save to history
    await db.execute(text(
        "INSERT INTO chat_history (role, content) VALUES (:role, :content)"
    ), {"role": "user", "content": payload.message})
    await db.execute(text(
        "INSERT INTO chat_history (role, content) VALUES (:role, :content)"
    ), {"role": "assistant", "content": response})
    await db.commit()
    
    return {"response": response}

@router.get("/history")
async def get_history(db: AsyncSession = Depends(get_db)):
    result = await db.execute(text(
        "SELECT role, content, created_at FROM chat_history ORDER BY created_at DESC LIMIT 50"
    ))
    rows = result.fetchall()
    return [{"role": r.role, "content": r.content, "created_at": str(r.created_at)} for r in rows]
