# FinPilot AI 💰
### AI-Powered Personal Finance Advisor

A production-quality full-stack application featuring a **RAG-based financial advisor chatbot**, **anomaly detection**, and **receipt OCR** — built for Indian users with Gemini AI, FastAPI, Next.js, PostgreSQL, and pgvector.

---

## 🏗️ Architecture

```
finpilot/
├── backend/                    # FastAPI + Python
│   ├── main.py                 # App entry point + CORS
│   ├── requirements.txt
│   ├── .env.example
│   ├── db/
│   │   └── database.py         # PostgreSQL + pgvector init
│   ├── models/
│   │   └── models.py           # SQLAlchemy ORM models
│   ├── routers/
│   │   ├── chat.py             # RAG chat endpoint
│   │   ├── expenses.py         # CRUD expenses
│   │   ├── anomalies.py        # Anomaly detection
│   │   └── ocr.py              # Receipt scanning
│   └── services/
│       ├── gemini_service.py   # Gemini LLM + embeddings + RAG
│       ├── anomaly_service.py  # IQR + Z-score detection
│       └── ocr_service.py      # Gemini Vision OCR
│
└── frontend/                   # Next.js 14 + TypeScript
    └── src/app/
        ├── dashboard/          # Charts + summary
        ├── chat/               # RAG chat UI
        ├── expenses/           # Expense tracker
        ├── anomalies/          # Anomaly dashboard
        └── upload/             # Receipt OCR
```

---

## ⚙️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Recharts |
| Backend | FastAPI, Python 3.11 |
| Database | PostgreSQL + pgvector |
| LLM | Google Gemini 1.5 Flash |
| Embeddings | Gemini embedding-001 (768-dim) |
| RAG | pgvector cosine similarity search |
| Anomaly Detection | IQR + Z-score (NumPy) |
| OCR | Gemini 1.5 Flash Vision API |

---

## 🚀 Setup & Run (Local)

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ with pgvector extension
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

---

### Step 1: Install PostgreSQL + pgvector

**Ubuntu/Debian:**
```bash
sudo apt install postgresql postgresql-contrib
sudo apt install postgresql-15-pgvector

# Start postgres
sudo service postgresql start

# Create database
sudo -u postgres psql -c "CREATE DATABASE finpilot;"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'password';"
```

**Mac (Homebrew):**
```bash
brew install postgresql@15
brew install pgvector

# Start postgres
brew services start postgresql@15

# Create database
psql postgres -c "CREATE DATABASE finpilot;"
```

---

### Step 2: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
```

Edit `.env`:
```
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/finpilot
PGVECTOR_URL=postgresql://postgres:password@localhost:5432/finpilot
```

Run backend:
```bash
uvicorn main:app --reload --port 8000
```

✅ Backend running at: `http://localhost:8000`
✅ API docs at: `http://localhost:8000/docs`

---

### Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create env file
echo 'NEXT_PUBLIC_API_URL=http://localhost:8000' > .env.local

# Run dev server
npm run dev
```

✅ Frontend running at: `http://localhost:3000`

---

## 🌐 Deploy to Production

### Backend → Render (Free)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo, set root directory to `backend/`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables in Render dashboard

### Database → Neon (Free PostgreSQL + pgvector)

1. Go to [neon.tech](https://neon.tech) → Create project
2. Neon supports pgvector natively — no extra setup
3. Copy the connection string and update `DATABASE_URL` and `PGVECTOR_URL` in Render

### Frontend → Vercel (Free)

1. Go to [vercel.com](https://vercel.com) → Import Git repo
2. Set root directory to `frontend/`
3. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-render-url.onrender.com`
4. Deploy

---

## 🧠 Features

### 1. RAG Financial Advisor
- Financial knowledge seeded into pgvector as 768-dim embeddings
- User query → cosine similarity search → top-k context → Gemini generates grounded response
- Conversation history maintained per session

### 2. Anomaly Detection
- **IQR method**: flags expenses outside Q1-1.5×IQR to Q3+1.5×IQR range per category
- **Z-score method**: flags expenses with |z| > 2.0 (medium) or > 3.0 (high severity)
- Gemini generates natural language insights about detected anomalies

### 3. Receipt OCR
- Upload receipt image → Gemini 1.5 Flash Vision extracts merchant, amount, category, date
- Auto-saved to expense tracker
- Supports JPG, PNG

### 4. Expense Dashboard
- Category-wise pie chart and bar chart via Recharts
- Real-time totals and transaction count

---

## 📊 Resume Bullet Points

- Built a RAG-based financial advisor chatbot using Gemini embeddings and pgvector cosine similarity for context-grounded responses
- Implemented statistical anomaly detection (IQR + Z-score) on expense data with Gemini-powered natural language insights
- Developed receipt OCR pipeline using Gemini 1.5 Flash Vision API to auto-extract and categorize expenses from images
- Designed full-stack architecture: Next.js 14 frontend, FastAPI backend, PostgreSQL + pgvector, deployed on Vercel + Render
