# ScamShield AI — Explainable AI-Based Job Scam Detection and Risk Assessment Platform

**ScamShield AI** is an advanced, production-grade cybersecurity and data science web application engineered to protect job seekers, educational institutions, and talent networks from employment scams, advance-fee fraud, counterfeit checks, phishing traps, and fraudulent recruiters.

---

## Key Features

1. **Job Scam Analyzer**:
   - Analyzes pasted job descriptions, recruitment emails, SMS / WhatsApp messages, and formal offer letters.
   - Validated `.txt` and `.csv` file upload support (up to 2MB).
   - Dual-engine architecture: Combines statistical **TF-IDF + Logistic Regression Machine Learning** with a deterministic **Security Indicator Rule Engine**.
   - **Exact Phrase Evidence Highlighting**: Renders submitted text with interactive, color-coded highlights linked directly to triggered risk indicators.
   - Outputs a calibrated **Risk Score (0–100)**, **Risk Category** (*Low Risk*, *Medium Risk*, *High Risk*), **Confidence Estimate**, and tailored safety actions.
   - Strictly emphasizes that the risk score is an estimate based on pattern matching, not definitive legal proof of fraud.

2. **Explainable AI (XAI)**:
   - Full transparency: Distinguishes statistical machine-learning probability and token contributions (e.g. `wire (+2.85)`, `zelle (+3.10)`, `interview (-1.85)`) from deterministic rule indicators.
   - Explains the scam mechanism behind each warning with direct citations from the input text.
   - Avoids treating individual indicators (e.g., a free webmail address) as absolute proof of fraud.

3. **Company and Recruiter Verification Tool**:
   - Fields for Company Name, Official Website, Recruiter Email, and Job URL.
   - Safe domain alignment checks: Detects discrepancies between recruiter email domain and corporate website domain.
   - Identifies free commercial webmail (@gmail.com, @yahoo.com) and homoglyph / hyphenated lookalike phishing domains.
   - Clearly labels results **"Not Verified"** (Zero-fabrication policy; never generates fake verification badges without authentic registrar lookup).
   - Provides safe 5-step manual verification guidelines (DNS MX checks, WHOIS creation date, official careers requisition lookup, and corporate telephone switchboard).

4. **Analytics Intelligence Dashboard**:
   - Displays real computed statistics derived dynamically from stored analyses (not hardcoded dummy data).
   - Risk distribution ratios (Low / Medium / High), average global risk score, and most frequent indicator occurrences.
   - Recent analysis activity timeline with deep-link navigation.

5. **Auditable Analysis History**:
   - Persistent storage backed by JSON file system storage (`data/history.json`) with in-memory caching.
   - Real-time search, risk category filtering (*All*, *High Risk*, *Medium Risk*, *Low Risk*), view details, and individual deletion.
   - One-click **Export History as CSV**.

6. **Synthetic Benchmark Dataset (110 Labeled Rows)**:
   - Includes `data/job_scam_dataset.csv` with 110 synthetically labeled examples (55 Legitimate, 55 Scam).
   - Covers advance-fee fraud, fake check schemes, credential phishing, Telegram/WhatsApp redirects, reshipping mules, and legitimate corporate offers.
   - Downloadable CSV directly from the web interface.
   - Documented holdout test evaluation: Accuracy: 95.5%, Precision: 0.92, Recall: 1.00, F1: 0.96.

7. **Deep AI Forensics (Gemini 3.8 Flash)**:
   - Optional server-side integration powered by `@google/genai` with model `gemini-3.8-flash`.
   - Synthesizes threat actor personas, psychological manipulation vectors, and tailored remediation steps.
   - Secure server-only API key handling via `GEMINI_API_KEY` (never exposed to browser client).

8. **Printable Security Assessment Reports**:
   - Formatted, print-ready security brief and JSON export for filing complaints with consumer protection agencies (FTC, IC3).

---

## Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion.
- **Backend / Server**: Express 4, Node.js / `tsx`, `@google/genai` SDK.
- **ML Engine**: Scikit-Learn Logistic Regression & TF-IDF Vectorizer with reproducible Python training pipeline (`ml_pipeline/train.py`) and portable mathematical inference engine (`server/engine.ts`).
- **Storage**: Persistent file-backed store (`data/history.json`).

---

## Installation & Running

### 1. Web Application (Full-Stack Express + Vite)
```bash
# Install dependencies
npm install

# Start the full-stack application on port 3000
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Running Automated Tests
```bash
# Runs the 18-point engine test suite (edge cases, scams, legit offers, domain matching)
npx tsx tests/engine.test.ts
```

### 3. Running the Python ML Pipeline (Optional)
```bash
# Navigate to Python pipeline
cd ml_pipeline

# Install Python requirements
pip install -r requirements.txt

# Train model & print evaluation report
python train.py

# Launch standalone Python Flask API
python app.py
```

---

## Render Deployment Guide (Node.js 24)

### Option A: Render Web Service (Full-Stack Recommended)
This deploys the full application including all REST API endpoints (`/api/analyze`, `/api/history`, `/api/analytics`, `/api/dataset/csv`), the dual-engine ML/rule pipeline, persistent storage, and built frontend:
1. In the **Render Dashboard**, click **New +** -> **Web Service**.
2. Connect your Git repository.
3. Configure settings:
   - **Environment**: `Node`
   - **Node Version**: Set environment variable `NODE_VERSION: 24.0.0` (or `22.14.0`).
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
4. Add environment variables:
   - `NODE_ENV`: `production`
   - `GEMINI_API_KEY`: *(Optional)* Your Gemini API key for Deep AI Threat Forensics.
5. Click **Deploy Web Service**.

### Option B: Render Static Site (Frontend SPA Only)
If deploying purely as a static single-page application:
- **Build Command**: `npm ci && npm run build`
- **Publish Directory**: `dist`
- **Node Version**: Set environment variable `NODE_VERSION: 24.0.0`.

### Option C: Optional Python Flask ML Backend on Render
If you want to host the standalone Python Flask microservice:
- **Root Directory**: `ml_pipeline`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn -w 2 -b 0.0.0.0:$PORT app:app` (or `python app.py`)

---

## Dependency Conflict Resolution (Root Cause & Fix)

### Issue
Deployments failed with:
```
npm error code ERESOLVE could not resolve
Found: esbuild@0.25.12
Could not resolve dependency: peerOptional esbuild ^0.27.0 || ^0.28.0 from vite@8.3.4
```

### Root Cause
`package.json` had an outdated, conflicting `"esbuild": "^0.25.0"` explicitly pinned in `devDependencies`. Both `vite@8.3.4` (which requires `esbuild@^0.27.0 || ^0.28.0`) and `tsx@4.23.15` (which requires `esbuild@~0.28.0`) require esbuild `0.28.x`. npm's peer dependency solver rejected the incompatible `0.25.x` version when building in clean CI environments.

### Solution Applied
1. Removed the conflicting explicit `"esbuild": "^0.25.0"` declaration from root `devDependencies`.
2. Added `"engines": { "node": ">=22.12.0" }` to `package.json`, ensuring full compatibility with Node.js 24 and Node.js 22 LTS on Render.
3. Generated a clean, fully consistent `package-lock.json` with 0 vulnerabilities and 0 peer conflicts.
4. Tested clean installation with `npm ci` and production build with `npm run build`.

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `GEMINI_API_KEY` | Optional key for Deep AI Forensics powered by Gemini 3.8 Flash. Baseline ML and Rule engines operate 100% offline without any API key. | Optional |
| `PORT` | Web server listening port (Default: 3000). | Optional |

---

## Dataset Schema

The synthetic dataset file is located at `data/job_scam_dataset.csv` with the following columns:
- `id`: Sequential sample identifier (1 to 110).
- `message_text`: Synthetic job description, email, SMS, or offer text.
- `label`: Binary classification target (`0` = Legitimate-looking, `1` = Suspicious / Scam).
- `scam_type`: Category (e.g. *Advance-Fee Fraud*, *Fake Check / Money Mule*, *Credential Harvesting*, *Legitimate Job Offer*).
- `warning_indicators`: Comma-separated list of triggered heuristics.

---

## Evaluation Benchmark Output (Holdout Test Set)

```
Test Split Size: 22 samples (Stratified 80/20 split, seed=42)
Accuracy:        0.9545 (95.5%)
Precision:       0.9167
Recall:          1.0000
F1-Score:        0.9565

Confusion Matrix:
[[10,  1],   <- True Negatives: 10, False Positives: 1
 [ 0, 11]]   <- False Negatives: 0, True Positives: 11
```
*Notice: Performance metrics are calculated on the synthetic benchmark dataset and should not be construed as absolute proof of real-world scam detection accuracy.*

---

## Safety & Ethics Principles

- **Zero Credential Collection**: ScamShield AI never asks for bank PINs, passwords, OTPs, or Social Security Numbers.
- **Heuristic Estimate**: Risk scores are pattern-matching estimates and do not represent formal criminal accusations.
- **Reporting Channels**: Suspected employment fraud should be reported to [reportfraud.ftc.gov](https://reportfraud.ftc.gov) or [ic3.gov](https://www.ic3.gov).
