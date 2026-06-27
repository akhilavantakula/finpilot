from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from db.database import get_db
from services.ocr_service import extract_receipt_data
from datetime import date

router = APIRouter()

@router.post("/scan-receipt")
async def scan_receipt(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    contents = await file.read()
    result = await extract_receipt_data(contents)
    
    if not result["success"]:
        return {"success": False, "error": result["error"]}
    
    data = result["data"]
    
    # Auto-save to expenses
    expense_date = data.get("date", str(date.today()))
    await db.execute(text("""
        INSERT INTO expenses (description, amount, category, date)
        VALUES (:description, :amount, :category, :date)
    """), {
        "description": data["description"],
        "amount": float(data["amount"]),
        "category": data["category"],
        "date": expense_date
    })
    await db.commit()
    
    return {"success": True, "extracted": data, "message": "Receipt scanned and expense saved!"}
