import os
import json
import re
from PIL import Image
import io

from dotenv import load_dotenv
from google import genai

load_dotenv()


# Gemini new SDK client
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


MODEL = "gemini-2.0-flash"


CATEGORIES = [
    "Food & Dining",
    "Transport",
    "Shopping",
    "Entertainment",
    "Health & Medical",
    "Utilities",
    "Groceries",
    "Other"
]



async def extract_receipt_data(image_bytes: bytes) -> dict:
    """
    Extract expense data from receipt image using Gemini Vision.
    Returns structured expense data.
    """


    image = Image.open(
        io.BytesIO(image_bytes)
    )


    prompt = f"""
Analyze this receipt image and extract expense information.

Return ONLY valid JSON.
Do not add markdown.
Do not add explanations.

JSON format:

{{
  "description": "merchant name or purchased item",
  "amount": number only,
  "category": one of {CATEGORIES},
  "date": "YYYY-MM-DD"
}}


If receipt is unclear return:

{{
 "error": "Could not extract receipt data clearly"
}}
"""


    response = client.models.generate_content(
        model=MODEL,
        contents=[
            prompt,
            image
        ]
    )


    raw = response.text.strip()


    # Remove markdown fences if Gemini adds them
    raw = re.sub(
        r"```json|```",
        "",
        raw
    ).strip()



    try:

        data = json.loads(raw)


        if "error" in data:
            return {
                "success": False,
                "error": data["error"]
            }



        required_fields = [
            "description",
            "amount",
            "category",
            "date"
        ]


        for field in required_fields:

            if field not in data:
                return {
                    "success": False,
                    "error": f"Missing field: {field}"
                }



        # Validate category

        if data["category"] not in CATEGORIES:
            data["category"] = "Other"



        # Convert amount safely

        try:
            data["amount"] = float(
                data["amount"]
            )

        except:
            return {
                "success": False,
                "error": "Invalid amount detected"
            }



        return {
            "success": True,
            "data": data
        }



    except json.JSONDecodeError:

        return {
            "success": False,
            "error": "Failed to parse receipt. Please try a clearer image."
        }