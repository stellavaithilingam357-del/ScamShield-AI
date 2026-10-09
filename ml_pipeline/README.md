# ScamShield AI — Python Machine Learning Pipeline

This module implements the **Reproducible Explainable Machine Learning (ML)** and **Rule-Based Indicator Engine** for ScamShield AI.

## Architecture

1. **TF-IDF Vectorizer**: Sublinear TF-IDF with unigrams & bigrams (`ngram_range=(1,2)`), English stop words removal, max 600 features.
2. **Logistic Regression**: L2 regularization (`C=1.5`, solver `liblinear`, `random_state=42`) trained on a stratified 80/20 train/test split.
3. **Indicator Rule Engine**: Deterministic regex and token pattern matching detecting Advance-Fee demands, P2P payment channels (Zelle, Cash App, Crypto), PII/Credential harvesting, Unrealistic salaries, Off-platform messaging, and Impersonation.
4. **Explainable AI (XAI)**:
   - Token-level weight contributions from Logistic Regression coefficients.
   - Exact text span boundary extraction for highlighted evidence.
   - Dual-engine separation: distinguishes statistical ML probabilities from deterministic rule matches.

## Dataset
- Location: `data/job_scam_dataset.csv`
- Total samples: 110 synthetically labeled examples (55 Legitimate, 55 Scam).
- Features: `id`, `message_text`, `label` (0 = Legitimate, 1 = Scam), `scam_type`, `warning_indicators`.

## Training Instructions

```bash
# 1. Install dependencies
pip install -r ml_pipeline/requirements.txt

# 2. Train and evaluate the model
python ml_pipeline/train.py
```

The script will:
- Split the dataset into 88 training samples and 22 holdout test samples.
- Compute Holdout Accuracy, Precision, Recall, F1-Score, and Confusion Matrix.
- Save serialized model artifacts to `ml_pipeline/artifacts/`:
  - `logistic_regression_model.joblib`
  - `tfidf_vectorizer.joblib`
  - `model_metadata.json`
  - `portable_model.json` (Used for zero-dependency inference in web microservices)

## Running the Flask Backend

```bash
python ml_pipeline/app.py
# Server starts on http://localhost:5000
```

## Evaluation Results (Synthetic Benchmark Holdout)
- **Accuracy**: ~95.5%
- **Precision**: 0.92
- **Recall**: 1.00
- **F1-Score**: 0.96
- *Note*: Results reflect synthetic benchmark data. ScamShield AI clearly labels scores as heuristic estimates and does not claim infallible real-world scam detection.
