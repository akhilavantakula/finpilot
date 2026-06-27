from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from db.database import get_db
from services.anomaly_service import detect_anomalies, get_anomaly_insights

router = APIRouter()

@router.get("/")
async def get_anomalies(db: AsyncSession = Depends(get_db)):
    result = await db.execute(text(
        "SELECT id, description, amount, category, date FROM expenses ORDER BY date DESC LIMIT 100"
    ))
    rows = result.fetchall()
    expenses = [
        {"id": r.id, "description": r.description, "amount": r.amount,
         "category": r.category, "date": str(r.date)}
        for r in rows
    ]
    
    anomalies = detect_anomalies(expenses)
    insights = await get_anomaly_insights(anomalies)
    
    return {
        "anomalies": anomalies,
        "insights": insights,
        "total_flagged": len(anomalies)
    }
