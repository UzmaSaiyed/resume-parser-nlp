# FINAL VERSION – PDF + TEXT SUPPORT

from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import os
import pdfplumber

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
# CREATE APP
# -----------------------------
app = Flask(__name__)
CORS(app)

stemmer = PorterStemmer()
lemmatizer = WordNetLemmatizer()

# -----------------------------
# PDF TEXT EXTRACTION
# -----------------------------
def extract_text_from_pdf(file):
    text = ""
    try:
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    text += t + "\n"
    except Exception as e:
        print("PDF read error:", e)
    return text


# -----------------------------
# TEXT PREPROCESSING
# -----------------------------
def preprocess_text(text):
    if not text:
        return []

    text = text.lower()
    text = re.sub(r"[^a-z\s]", "", text)

    tokens = text.split()
    tokens = [w for w in tokens if w not in STOPWORDS]
    tokens = [stemmer.stem(w) for w in tokens]

    try:
        tokens = [lemmatizer.lemmatize(w) for w in tokens]
    except:
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
# MATCH LOGIC
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

        # 1️⃣ If file uploaded
        if "resume_file" in request.files:
            file = request.files["resume_file"]
            resume_text = extract_text_from_pdf(file)

        # 2️⃣ If text pasted
        else:
            data = request.json or {}
            resume_text = data.get("resume", "")

        job_description = request.form.get("job_description") or \
                          (request.json or {}).get("job_description", "")

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
