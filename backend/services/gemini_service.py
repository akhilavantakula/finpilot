import os
import json
import asyncpg
from dotenv import load_dotenv

from google import genai

load_dotenv()


# Gemini client
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


# Models
CHAT_MODEL = "gemini-2.0-flash"
EMBEDDING_MODEL = "text-embedding-004"


FINANCIAL_KNOWLEDGE = [
    "Emergency funds should cover 3-6 months of living expenses kept in liquid accounts.",
    "The 50/30/20 rule suggests 50% needs, 30% wants, 20% savings and investments.",
    "SIP in mutual funds is useful for long term wealth creation in India.",
    "ELSS mutual funds provide tax benefits under Section 80C up to Rs 1.5 lakh.",
    "Index funds usually have lower expense ratios than active funds.",
    "Term insurance is recommended for income earners with dependents.",
    "Credit card bills should be paid fully every month to avoid high interest.",
    "PPF provides tax-free returns with a 15 year lock-in period.",
    "Diversification reduces investment risk.",
    "Inflation reduces purchasing power, investments should beat inflation.",
    "Health insurance of Rs 5-10 lakh is recommended.",
    "NPS provides retirement benefits and tax savings.",
    "Avoid lifestyle inflation after salary increases."
]



def create_embedding(text):

    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text
    )

    return response.embeddings[0].values



def vector_to_pg(vector):
    """
    Convert python list to pgvector format
    Example:
    [0.1,0.2] -> '[0.1,0.2]'
    """
    return "[" + ",".join(
        str(x) for x in vector
    ) + "]"



async def seed_knowledge_base():

    conn = await asyncpg.connect(
        os.getenv("PGVECTOR_URL")
    )


    try:

        count = await conn.fetchval(
            "SELECT COUNT(*) FROM financial_knowledge"
        )


        if count > 0:
            return


        for item in FINANCIAL_KNOWLEDGE:

            embedding = create_embedding(item)

            pg_embedding = vector_to_pg(
                embedding
            )


            await conn.execute(
                """
                INSERT INTO financial_knowledge
                (
                    content,
                    embedding,
                    source
                )
                VALUES
                ($1,$2,$3)
                """,
                item,
                pg_embedding,
                "FinPilot Knowledge Base"
            )


        print("✅ Knowledge base seeded")


    finally:
        await conn.close()




async def retrieve_context(
    query,
    top_k=3
):

    conn = await asyncpg.connect(
        os.getenv("PGVECTOR_URL")
    )


    try:

        query_embedding = create_embedding(
            query
        )


        pg_embedding = vector_to_pg(
            query_embedding
        )


        rows = await conn.fetch(
            """
            SELECT
                content,
                embedding <=> $1::vector AS distance
            FROM financial_knowledge
            ORDER BY distance
            LIMIT $2
            """,
            pg_embedding,
            top_k
        )


        return "\n".join(
            row["content"]
            for row in rows
        )


    finally:
        await conn.close()




async def chat_with_rag(
    user_message,
    history=None
):

    context = await retrieve_context(
        user_message
    )


    prompt = f"""

You are FinPilot, an AI financial assistant for Indian users.

Use this financial knowledge:

{context}


User question:

{user_message}


Rules:

- Give India specific advice
- Mention INR where needed
- Explain simply
- Do not invent facts
- Mention PPF, SIP, NPS, ELSS when relevant
- Add disclaimer that you are not a SEBI registered advisor

"""


    response = client.models.generate_content(
        model=CHAT_MODEL,
        contents=prompt
    )


    return response.text




def generate_text(prompt):

    response = client.models.generate_content(
        model=CHAT_MODEL,
        contents=prompt
    )

    return response.text