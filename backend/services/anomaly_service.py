import numpy as np
from typing import List, Dict
from services.gemini_service import generate_text

def detect_anomalies(expenses: List[Dict]) -> List[Dict]:
    """
    Detect anomalous expenses using IQR + Z-score methods per category.
    Returns list of flagged anomalies with reasons.
    """
    if len(expenses) < 5:
        return []

    # Group by category
    categories = {}
    for exp in expenses:
        cat = exp["category"]
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(exp)

    anomalies = []

    for category, cat_expenses in categories.items():
        if len(cat_expenses) < 3:
            continue

        amounts = [e["amount"] for e in cat_expenses]
        amounts_arr = np.array(amounts)

        mean = np.mean(amounts_arr)
        std = np.std(amounts_arr)
        q1 = np.percentile(amounts_arr, 25)
        q3 = np.percentile(amounts_arr, 75)
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr

        for exp in cat_expenses:
            amount = exp["amount"]
            z_score = (amount - mean) / std if std > 0 else 0
            is_iqr_outlier = amount < lower or amount > upper
            is_zscore_outlier = abs(z_score) > 2.0

            if is_iqr_outlier or is_zscore_outlier:
                reason = []
                if amount > upper:
                    reason.append(f"₹{amount:.0f} is {((amount - mean) / mean * 100):.0f}% above average ₹{mean:.0f} for {category}")
                elif amount < lower:
                    reason.append(f"₹{amount:.0f} is unusually low for {category} (avg ₹{mean:.0f})")
                if abs(z_score) > 2.0:
                    reason.append(f"Z-score: {z_score:.2f} (threshold: 2.0)")

                anomalies.append({
                    "id": exp["id"],
                    "description": exp["description"],
                    "amount": amount,
                    "category": category,
                    "date": exp["date"],
                    "reason": ". ".join(reason),
                    "z_score": round(z_score, 2),
                    "severity": "high" if abs(z_score) > 3 else "medium"
                })

    return anomalies

async def get_anomaly_insights(anomalies: List[Dict]) -> str:
    """Use Gemini to generate natural language insights about anomalies."""
    if not anomalies:
        return "No anomalies detected in your recent expenses. Your spending looks consistent!"

    anomaly_text = "\n".join([
        f"- {a['description']}: ₹{a['amount']} ({a['category']}) on {a['date']} — {a['reason']}"
        for a in anomalies[:5]
    ])

    prompt = f"""You are a financial advisor. Analyze these spending anomalies for an Indian user and give brief, actionable advice:

{anomaly_text}

Give 2-3 sentences of practical advice. Be direct and helpful."""

    return await generate_text(prompt)
