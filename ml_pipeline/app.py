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

ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt', 'csv'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def extract_text_from_file_object(file_storage):
    """
    Extracts readable text from uploaded PDF, DOCX, TXT, or CSV files.
    - PDF: PyMuPDF (fitz)
    - DOCX: python-docx
    - TXT: UTF-8 with robust fallback
    - CSV: pandas
    """
    if not file_storage or not file_storage.filename:
        raise ValueError("No file provided or file has no name.")

    filename = file_storage.filename
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''

    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file format '.{ext}'. Please upload a PDF, DOCX, TXT, or CSV file.")

    content_bytes = file_storage.read()

    if not content_bytes or len(content_bytes) == 0:
        raise ValueError("The uploaded file is empty.")

    if len(content_bytes) > MAX_FILE_SIZE:
        raise ValueError("File exceeds 10MB limit. Please upload a smaller file.")

    extracted_text = ""

    # 1. PDF Extraction using PyMuPDF (fitz)
    if ext == 'pdf':
        try:
            import fitz
            doc = fitz.open(stream=content_bytes, filetype="pdf")
            if doc.is_encrypted:
                raise ValueError("Encrypted or password-protected PDF files are not supported.")
            pages = []
            for page in doc:
                text = page.get_text()
                if text:
                    pages.append(text)
            doc.close()
            extracted_text = "\n\n".join(pages).strip()
        except ImportError:
            raise RuntimeError("PyMuPDF (fitz) is not installed on the server.")
        except Exception as e:
            raise ValueError(f"Corrupted or unreadable PDF file: {str(e)}")

    # 2. DOCX Extraction using python-docx
    elif ext == 'docx':
        try:
            import docx
            import io
            doc = docx.Document(io.BytesIO(content_bytes))
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            for table in doc.tables:
                for row in table.rows:
                    for cell in row.cells:
                        if cell.text.strip():
                            paragraphs.append(cell.text.strip())
            extracted_text = "\n\n".join(paragraphs).strip()
        except ImportError:
            raise RuntimeError("python-docx is not installed on the server.")
        except Exception as e:
            raise ValueError(f"Corrupted or unreadable DOCX file: {str(e)}")

    # 3. TXT Extraction using proper UTF-8 encoding with error handling
    elif ext == 'txt':
        try:
            extracted_text = content_bytes.decode('utf-8')
        except UnicodeDecodeError:
            try:
                extracted_text = content_bytes.decode('latin-1')
            except Exception as e:
                raise ValueError(f"Failed to decode TXT file with valid encoding: {str(e)}")
        extracted_text = extracted_text.strip()

    # 4. CSV Extraction using pandas
    elif ext == 'csv':
        try:
            import pandas as pd
            import io
            try:
                df = pd.read_csv(io.BytesIO(content_bytes), encoding='utf-8')
            except UnicodeDecodeError:
                df = pd.read_csv(io.BytesIO(content_bytes), encoding='latin-1')

            if df.empty:
                raise ValueError("The uploaded CSV file contains no data rows.")

            # Identify candidate text columns
            text_cols = [c for c in df.columns if any(k in str(c).lower() for k in ['message', 'text', 'desc', 'content', 'job', 'body', 'post', 'offer'])]
            if text_cols:
                extracted_text = "\n\n".join(df[text_cols[0]].dropna().astype(str).tolist())
            else:
                extracted_text = "\n\n".join(df.astype(str).agg(' '.join, axis=1).tolist())
            extracted_text = extracted_text.strip()
        except ImportError:
            raise RuntimeError("pandas is not installed on the server.")
        except Exception as e:
            raise ValueError(f"Corrupted or invalid CSV file: {str(e)}")

    if not extracted_text or not extracted_text.strip():
        raise ValueError("The uploaded file contains no readable text.")

    return extracted_text, filename, ext

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "service": "ScamShield AI Python Backend",
        "model_loaded": model_data is not None,
        "supported_file_types": ["pdf", "docx", "txt", "csv"]
    })

@app.route("/api/extract-text", methods=["POST"])
@app.route("/api/upload", methods=["POST"])
def extract_text_route():
    file = request.files.get("file") or request.files.get("document")
    if not file:
        return jsonify({"error": "No file uploaded. Please include a file in the 'file' field."}), 400

    try:
        text, filename, ext = extract_text_from_file_object(file)
        return jsonify({
            "text": text,
            "filename": filename,
            "file_type": ext,
            "character_count": len(text)
        })
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": f"Server error processing file: {str(e)}"}), 500

@app.route("/api/analyze", methods=["POST"])
def analyze():
    text = ""
    filename = None

    # Check if file was sent as multipart/form-data
    if request.files and ("file" in request.files or "document" in request.files):
        file = request.files.get("file") or request.files.get("document")
        try:
            text, filename, _ = extract_text_from_file_object(file)
        except ValueError as ve:
            return jsonify({"error": str(ve)}), 400
        except Exception as e:
            return jsonify({"error": f"Failed to extract text from uploaded file: {str(e)}"}), 500
    elif request.is_json:
        payload = request.get_json(silent=True) or {}
        text = payload.get("text", "").strip()
    else:
        text = (request.form.get("text") or "").strip()

    if not text:
        return jsonify({"error": "Empty text provided or uploaded file contained no readable text."}), 400
    if len(text) > 50000:
        return jsonify({"error": "Text exceeds maximum 50,000 characters limit"}), 400

    # 1. Rule Engine
    rule_indicators, rule_points = extract_rule_evidence(text)

    # 2. ML Engine
    ml_prob, influential_tokens = compute_ml_prediction(text)
    ml_score = ml_prob * 100

    # 3. Transparent Combined Risk Score (Weighted blend capped at 100)
    combined_score = min(100, round((rule_points * 0.6) + (ml_score * 0.4)))
    if rule_points >= 50:
        combined_score = max(combined_score, 75)

    if combined_score < 35:
        category = "Low Risk"
    elif combined_score < 70:
        category = "Medium Risk"
    else:
        category = "High Risk"

    response_data = {
        "risk_score": combined_score,
        "risk_category": category,
        "confidence_estimate": round(max(ml_prob, 1.0 - ml_prob) * 100, 1),
        "rule_evidence": rule_indicators,
        "ml_evidence": {
            "model_probability": round(ml_prob, 4),
            "influential_features": influential_tokens
        },
        "disclaimer": "This score is an estimate based on pattern matching and statistical ML classification, not definitive proof of fraud."
    }

    if filename:
        response_data["filename"] = filename
        response_data["extracted_text_preview"] = text[:300] + "..." if len(text) > 300 else text

    return jsonify(response_data)

if __name__ == "__main__":
    app.run(port=5000, debug=True)

