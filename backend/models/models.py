from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Text
from sqlalchemy.sql import func
from db.database import Base

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    description = Column(Text, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String(100), nullable=False)
    date = Column(Date, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

class FinancialKnowledge(Base):
    __tablename__ = "financial_knowledge"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    source = Column(String(255))
    created_at = Column(DateTime, server_default=func.now())

class ChatHistory(Base):
    __tablename__ = "chat_history"
    id = Column(Integer, primary_key=True, index=True)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
