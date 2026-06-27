from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from db.database import get_db
from typing import Optional
from datetime import date

router = APIRouter()

class ExpenseCreate(BaseModel):
    description: str
    amount: float
    category: str
    date: date

@router.post("/")
async def add_expense(expense: ExpenseCreate, db: AsyncSession = Depends(get_db)):
    await db.execute(text("""
        INSERT INTO expenses (description, amount, category, date)
        VALUES (:description, :amount, :category, :date)
    """), expense.dict())
    await db.commit()
    return {"message": "Expense added successfully"}

@router.get("/")
async def get_expenses(
    limit: int = 50,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    if category:
        result = await db.execute(text(
            "SELECT * FROM expenses WHERE category = :category ORDER BY date DESC LIMIT :limit"
        ), {"category": category, "limit": limit})
    else:
        result = await db.execute(text(
            "SELECT * FROM expenses ORDER BY date DESC LIMIT :limit"
        ), {"limit": limit})
    
    rows = result.fetchall()
    return [
        {"id": r.id, "description": r.description, "amount": r.amount,
         "category": r.category, "date": str(r.date)}
        for r in rows
    ]

@router.get("/summary")
async def get_summary(db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("""
        SELECT category, SUM(amount) as total, COUNT(*) as count
        FROM expenses
        GROUP BY category
        ORDER BY total DESC
    """))
    rows = result.fetchall()
    total = await db.execute(text("SELECT SUM(amount) FROM expenses"))
    total_amount = total.scalar() or 0
    
    return {
        "by_category": [
            {"category": r.category, "total": r.total, "count": r.count}
            for r in rows
        ],
        "total_spent": total_amount
    }

@router.delete("/{expense_id}")
async def delete_expense(expense_id: int, db: AsyncSession = Depends(get_db)):
    await db.execute(text("DELETE FROM expenses WHERE id = :id"), {"id": expense_id})
    await db.commit()
    return {"message": "Deleted"}
