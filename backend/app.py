from flask import Flask, request, jsonify
from flask_cors import CORS
import re

from nltk.stem import PorterStemmer, WordNetLemmatizer

import nltk
import os

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


NLTK_DATA_DIR = "/tmp/nltk_data"
os.makedirs(NLTK_DATA_DIR, exist_ok=True)
nltk.data.path.append(NLTK_DATA_DIR)

for resource in ["stopwords", "wordnet", "omw-1.4"]:
    try:
        nltk.data.find(f"corpora/{resource}")
    except LookupError:
        nltk.download(resource, download_dir=NLTK_DATA_DIR)



# -----------------------------
# CREATE FLASK APP (ONLY ONCE)
# -----------------------------
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# -----------------------------
# TEXT PREPROCESSING
# -----------------------------
def preprocess_text(text):
    text = text.lower()
    text = re.sub(r'[^a-z\s]', '', text)

    tokens = text.split()

    tokens = [w for w in tokens if w not in STOPWORDS]

    stemmer = PorterStemmer()
    tokens = [stemmer.stem(w) for w in tokens]

    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(w) for w in tokens]

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
    resume_set = set(resume_tokens)
    jd_set = set(jd_tokens)

    if len(jd_set) == 0:
        return 0

    return round((len(resume_set & jd_set) / len(jd_set)) * 100, 2)


# -----------------------------
# API ROUTE
# -----------------------------
@app.route("/parse", methods=["POST"])
def parse_resume():
    data = request.json

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


# -----------------------------
# HOME ROUTE
# -----------------------------
@app.route("/")
def home():
    return "Resume Parser Backend is running"


# -----------------------------
# RUN SERVER
# -----------------------------

import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
