"""
ScamShield AI — Model Training & Evaluation Pipeline
Reproducible Text-Classification Pipeline using scikit-learn, TF-IDF & Logistic Regression.
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    precision_score,
    recall_score,
    f1_score,
    accuracy_score,
)
import joblib

def load_dataset(csv_path: str):
    print(f"[*] Loading dataset from: {csv_path}")
    df = pd.read_csv(csv_path)
    print(f"[+] Loaded {len(df)} samples. Class distribution:")
    print(df['label'].value_counts())
    return df

def train_and_evaluate(csv_path="data/job_scam_dataset.csv", output_dir="ml_pipeline/artifacts"):
    os.makedirs(output_dir, exist_ok=True)
    df = load_dataset(csv_path)

    X = df['message_text'].astype(str)
    y = df['label'].astype(int)

    # 80/20 Stratified train/test split with seed 42 to prevent leakage
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"[+] Training set size: {len(X_train)}, Test set size: {len(X_test)}")

    # TF-IDF Feature Extraction (unigrams + bigrams)
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=600,
        stop_words='english',
        sublinear_tf=True
    )
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)

    # Logistic Regression Classifier
    clf = LogisticRegression(C=1.5, penalty='l2', solver='liblinear', random_state=42)
    clf.fit(X_train_tfidf, y_train)

    # Evaluation on holdout test set
    y_pred = clf.predict(X_test_tfidf)
    y_prob = clf.predict_proba(X_test_tfidf)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    cm = confusion_matrix(y_test, y_pred).tolist()
    report = classification_report(y_test, y_pred, target_names=["Legitimate", "Scam"], output_dict=True)

    print("\n=================== MODEL EVALUATION METRICS ===================")
    print(f"Accuracy:        {acc:.4f} ({acc*100:.1f}%)")
    print(f"Precision:       {prec:.4f}")
    print(f"Recall:          {rec:.4f}")
    print(f"F1-Score:        {f1:.4f}")
    print(f"Confusion Matrix (TN, FP, FN, TP): {cm}")
    print("\nDetailed Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Legitimate", "Scam"]))
    print("=================================================================\n")

    # Save joblib model & vectorizer
    joblib.dump(clf, os.path.join(output_dir, "logistic_regression_model.joblib"))
    joblib.dump(vectorizer, os.path.join(output_dir, "tfidf_vectorizer.joblib"))

    # Extract top influential tokens for explainability
    feature_names = vectorizer.get_feature_names_out()
    coefs = clf.coef_[0]
    top_scam_indices = np.argsort(coefs)[-25:][::-1]
    top_legit_indices = np.argsort(coefs)[:25]

    top_scam_tokens = [{"token": feature_names[i], "weight": float(coefs[i])} for i in top_scam_indices]
    top_legit_tokens = [{"token": feature_names[i], "weight": float(coefs[i])} for i in top_legit_indices]

    metrics = {
        "model_name": "TF-IDF + Logistic Regression",
        "dataset_size": len(df),
        "train_size": len(X_train),
        "test_size": len(X_test),
        "random_state": 42,
        "test_metrics": {
            "accuracy": float(acc),
            "precision": float(prec),
            "recall": float(rec),
            "f1_score": float(f1),
            "confusion_matrix": cm,
            "classification_report": report
        },
        "intercept": float(clf.intercept_[0]),
        "top_scam_tokens": top_scam_tokens,
        "top_legit_tokens": top_legit_tokens,
        "vocabulary_size": len(vectorizer.vocabulary_),
        "calibration_status": "Uncalibrated Platt sigmoid probability estimate",
        "evaluation_notice": "Trained on synthetic balanced job text benchmark (n=110). Probabilities represent statistical heuristic estimates and should not be treated as absolute legal proof."
    }

    metadata_path = os.path.join(output_dir, "model_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metrics, f, indent=2)

    # Also export portable weights json for cross-platform Node/Flask runtime
    vocab_weights = {}
    idf_dict = {}
    for word, idx in vectorizer.vocabulary_.items():
        vocab_weights[word] = float(coefs[idx])
        idf_dict[word] = float(vectorizer.idf_[idx])

    portable_export = {
        "intercept": float(clf.intercept_[0]),
        "vocabulary": vectorizer.vocabulary_,
        "weights": vocab_weights,
        "idf": idf_dict,
        "metrics": metrics
    }
    with open(os.path.join(output_dir, "portable_model.json"), "w") as f:
        json.dump(portable_export, f, indent=2)

    print(f"[✓] Artifacts saved to {output_dir}")
    return metrics

if __name__ == "__main__":
    train_and_evaluate()
