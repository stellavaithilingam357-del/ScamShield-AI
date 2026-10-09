"""
ScamShield AI — Flask API Service
Provides ML inference, rule-based indicator scanning, recruiter verification, and risk reporting.
"""

import os
import re
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load portable weights if available
MODEL_FILE = os.path.join(os.path.dirname(__file__), "artifacts", "portable_model.json")
model_data = None
if os.path.exists(MODEL_FILE):
    with open(MODEL_FILE, "r") as f:
        model_data = json.load(f)

# Rule-Based Indicators Definition
INDICATORS = [
    {
        "id": "advance_fee",
        "name": "Advance Fee / Deposit Request",
        "severity": "CRITICAL",
        "points": 35,
        "patterns": [
            r"wire (a )?(refundable )?(deposit|fee)",
            r"pay (a )?(\$?\d+|fee|charge) (before|prior to|for)",
            r"onboarding fee",
            r"registration fee",
            r"security deposit",
            r"background check fee",
            r"screening fee",
            r"uniform fee",
            r"equipment fee"
        ],
        "explanation": "Legitimate employers never ask candidates to pay money upfront for applications, equipment deposits, or background checks."
    },
    {
        "id": "unregulated_payment",
        "name": "Irreversible / P2P Payment Channels",
        "severity": "HIGH",
        "points": 25,
        "patterns": [
            r"zelle",
            r"cash app",
            r"cashtag",
            r"venmo",
            r"western union",
            r"moneygram",
            r"bitcoin",
            r"usdt",
            r"gift card",
            r"crypto wallet"
        ],
        "explanation": "Payment requests via Zelle, Cash App, Crypto, or Gift Cards are hallmarks of employment scams because transactions cannot be reversed."
    },
    {
        "id": "unrealistic_compensation",
        "name": "Disproportionate Compensation Promise",
        "severity": "HIGH",
        "points": 20,
        "patterns": [
            r"\$\d{2,4}\s*(per|/)\s*(day|hour|hr|page)",
            r"\$([3-9]\d{3}|\d{5,})\s*(per|/)\s*(week|wk)",
            r"earn \$[4-9]\d{2,}\s*(daily|every day|per day)",
            r"make \$[3-9]\d{2,}\s*a week doing simple",
            r"high tax-free salary"
        ],
        "explanation": "Promises of exorbitant pay for entry-level or minimal tasks (e.g., $500/day for copy-pasting or typing) are designed to lure job seekers."
    },
    {
        "id": "unencrypted_social_redirect",
        "name": "Off-Platform Messaging Shift",
        "severity": "HIGH",
        "points": 20,
        "patterns": [
            r"telegram",
            r"t\.me/",
            r"whatsapp",
            r"skype (chat|text)",
            r"message @\w+"
        ],
        "explanation": "Scammers urge candidates onto Telegram or WhatsApp to evade enterprise email security and leave no corporate audit trail."
    },
    {
        "id": "sensitive_credential_harvesting",
        "name": "Premature Sensitive Data / Credential Theft",
        "severity": "CRITICAL",
        "points": 35,
        "patterns": [
            r"social security number|ssn",
            r"bank account (pin|login|password)",
            r"debit card pin",
            r"otp|one-time (passcode|password|code)",
            r"front and back (copies|picture) of your (credit card|driver)",
            r"mother'?s maiden name"
        ],
        "explanation": "Soliciting banking passwords, PINs, OTP codes, or full SSNs before formal in-person/official verified onboarding indicates identity theft."
    },
    {
        "id": "fake_check_reshipping",
        "name": "Fake Check / Reshipping Scheme",
        "severity": "CRITICAL",
        "points": 30,
        "patterns": [
            r"(cashier'?s?|advance)\s*check of \$\d+",
            r"deposit the check.*(wire|send|transfer) the remaining",
            r"overpayment",
            r"package (inspector|mule|forwarding|handling)",
            r"re-package.*supplies"
        ],
        "explanation": "Classic counterfeit check scam: the check initially appears to clear, but bounces days later after the victim has wired real money."
    },
    {
        "id": "free_webmail_impersonation",
        "name": "Generic Free Webmail for Enterprise HR",
        "severity": "MEDIUM",
        "points": 15,
        "patterns": [
            r"[a-zA-Z0-9._%+-]+@(gmail|yahoo|hotmail|outlook|protonmail|consultant)\.com"
        ],
        "explanation": "Global corporations and established firms use verified corporate domain emails, not free commercial webmail addresses."
    },
    {
        "id": "artificial_urgency",
        "name": "Artificial Urgency & No-Interview Hiring",
        "severity": "MEDIUM",
        "points": 15,
        "patterns": [
            r"urgent(ly)?|act fast|immediate hiring",
            r"within (2|24|48) hours",
            r"without (an? )?interview",
            r"no (resume|interview|experience) (needed|required)",
            r"limited slots"
        ],
        "explanation": "Pressure tactics rush victims into making unvetted financial or personal disclosures before having time to consult others."
    }
]

def extract_rule_evidence(text: str):
    matches = []
    total_rule_score = 0
    lowered = text.lower()

    for ind in INDICATORS:
        found_phrases = []
        for pat in ind["patterns"]:
            for m in re.finditer(pat, lowered):
                # Grab span
                start, end = m.span()
                matched_text = text[start:end]
                found_phrases.append({
                    "phrase": matched_text,
                    "start": start,
                    "end": end
                })
        if found_phrases:
            matches.append({
                "id": ind["id"],
                "name": ind["name"],
                "severity": ind["severity"],
                "points": ind["points"],
                "explanation": ind["explanation"],
                "phrases": found_phrases[:5]
            })
            total_rule_score += ind["points"]

    return matches, total_rule_score

def compute_ml_prediction(text: str):
    if not model_data:
        return 0.5, "ML weights not loaded. Run train.py first."

    # Compute TF-IDF on unigrams/bigrams
    vocab = model_data.get("vocabulary", {})
    weights = model_data.get("weights", {})
    intercept = model_data.get("intercept", 0.0)

    words = re.findall(r"\b[a-zA-Z]{2,}\b", text.lower())
    bigrams = [f"{words[i]} {words[i+1]}" for i in range(len(words)-1)]
    tokens = words + bigrams

    score = intercept
    influential_tokens = []

    for t in tokens:
        if t in weights:
            w = weights[t]
            score += w
            influential_tokens.append({"token": t, "weight": round(w, 4)})

    # Platt/Logistic Sigmoid
    import math
    try:
        prob = 1.0 / (1.0 + math.exp(-score))
    except OverflowError:
        prob = 1.0 if score > 0 else 0.0

    return prob, sorted(influential_tokens, key=lambda x: abs(x["weight"]), reverse=True)[:10]

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "service": "ScamShield AI Python Backend",
        "model_loaded": model_data is not None
    })

@app.route("/api/analyze", methods=["POST"])
def analyze():
    payload = request.get_json(force=True, silent=True) or {}
    text = payload.get("text", "").strip()

    if not text:
        return jsonify({"error": "Empty text provided"}), 400
    if len(text) > 50000:
        return jsonify({"error": "Text exceeds maximum 50,000 characters limit"}), 400

    # 1. Rule Engine
    rule_indicators, rule_points = extract_rule_evidence(text)

    # 2. ML Engine
    ml_prob, influential_tokens = compute_ml_prediction(text)
    ml_score = ml_prob * 100

    # 3. Transparent Combined Risk Score (Weighted blend capped at 100)
    # Rules provide concrete structural evidence, ML provides contextual semantic classification
    combined_score = min(100, round((rule_points * 0.6) + (ml_score * 0.4)))
    if rule_points >= 50:
        combined_score = max(combined_score, 75)

    if combined_score < 35:
        category = "Low Risk"
    elif combined_score < 70:
        category = "Medium Risk"
    else:
        category = "High Risk"

    return jsonify({
        "risk_score": combined_score,
        "risk_category": category,
        "confidence_estimate": round(max(ml_prob, 1.0 - ml_prob) * 100, 1),
        "rule_evidence": rule_indicators,
        "ml_evidence": {
            "model_probability": round(ml_prob, 4),
            "influential_features": influential_tokens
        },
        "disclaimer": "This score is an estimate based on pattern matching and statistical ML classification, not definitive proof of fraud."
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)
