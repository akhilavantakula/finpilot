from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def init_db():
    async with engine.begin() as conn:
        # Enable pgvector extension
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        
        # Expenses table
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS expenses (
                id SERIAL PRIMARY KEY,
                description TEXT NOT NULL,
                amount FLOAT NOT NULL,
                category TEXT NOT NULL,
                date DATE NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """))
        
        # Knowledge base for RAG
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS financial_knowledge (
                id SERIAL PRIMARY KEY,
                content TEXT NOT NULL,
                embedding vector(3072),
                source TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """))
        
        # Chat history
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS chat_history (
                id SERIAL PRIMARY KEY,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """))
        
        print("✅ Database initialized successfully")
