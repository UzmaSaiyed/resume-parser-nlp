# FINAL UPDATE – 11 JAN 2026
from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import os

from nltk.stem import PorterStemmer, WordNetLemmatizer

# -----------------------------
# STATIC STOPWORDS
# -----------------------------
STOPWORDS = {
    "i","me","my","myself","we","our","ours","you","your","yours",
    "he","him","his","she","her","it","its","they","them","their",
    "what","which","who","this","that","am","is","are","was","were",
    "be","been","being","have","has","had","do","does","did",
    "a","an","the","and","but","if","or","because","as","until",
    "while","of","at","by","for","with","about","against","between",
    "into","through","during","before","after","above","below",
    "to","from","up","down","in","out","on","off","over","under"
}

# -----------------------------
# CREATE FLASK APP
# -----------------------------
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# -----------------------------
# TEXT PREPROCESSING (SAFE)
# -----------------------------
stemmer = PorterStemmer()
lemmatizer = WordNetLemmatizer()

def preprocess_text(text):
    if not text:
        return []

    text = text.lower()
    text = re.sub(r"[^a-z\s]", "", text)

    tokens = text.split()
    tokens = [w for w in tokens if w not in STOPWORDS]

    tokens = [stemmer.stem(w) for w in tokens]

    # SAFE lemmatization (no crash if wordnet missing)
    try:
        tokens = [lemmatizer.lemmatize(w) for w in tokens]
    except Exception:
        pass

    return tokens

# -----------------------------
# SKILL EXTRACTION
# -----------------------------
SKILLS = [
    "python", "java", "sql", "nlp",
    "machine", "learning", "data",
    "analysis", "flask"
]

def extract_skills(tokens):
    return list(set([w for w in tokens if w in SKILLS]))

# -----------------------------
# MATCHING LOGIC
# -----------------------------
def calculate_match(resume_tokens, jd_tokens):
    if not jd_tokens:
        return 0
    return round(
        (len(set(resume_tokens) & set(jd_tokens)) / len(set(jd_tokens))) * 100,
        2
    )

# -----------------------------
# API ROUTE
# -----------------------------
@app.route("/parse", methods=["POST"])
def parse_resume():
    try:
        data = request.json or {}

        resume_text = data.get("resume", "")
        job_description = data.get("job_description", "")

        resume_tokens = preprocess_text(resume_text)
        jd_tokens = preprocess_text(job_description)

        skills = extract_skills(resume_tokens)
        match_score = calculate_match(resume_tokens, jd_tokens)

        return jsonify({
            "skills_found": skills,
            "match_percentage": match_score
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -----------------------------
# HOME ROUTE
# -----------------------------
@app.route("/")
def home():
    return "Resume Parser Backend is running"

# -----------------------------
# RUN SERVER
# -----------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
