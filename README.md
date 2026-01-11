# Resume Parser for Human Resource Managers

## Project Overview
This project is an NLP-based Resume Parser developed to help Human Resource Managers screen resumes efficiently. The system extracts relevant information from resumes and matches them against job descriptions or specified keywords using Natural Language Processing techniques.

---

## Objectives
- To build an NLP-based resume parser
- To extract skills, experience, and relevant keywords from resumes
- To match resumes with job descriptions or keywords
- To assist HR managers in shortlisting candidates

---

## Features
- User authentication using Supabase Email login
- Resume input in text format
- Job description or keyword-based input
- Skill extraction from resumes
- Experience extraction from resumes
- Spelling correction using Levenshtein distance
- Resume and job description matching
- Match percentage calculation
- Storage of parsed results in Supabase database

---

## NLP Techniques Used
- Tokenization
- Stop word removal
- Stemming
- Lemmatization
- Spelling correction using Levenshtein distance
- Information extraction
- Keyword-based matching

---

## Tech Stack
- Frontend: React  
- Backend: Python (Flask)  
- Authentication & Database: Supabase  
- NLP Libraries: NLTK, Levenshtein  

---

## System Architecture
1. User logs in using Supabase Email authentication.
2. User enters resume text and job description or keywords.
3. Frontend sends data to the Flask backend.
4. Backend applies NLP preprocessing and extraction techniques.
5. Skills and experience are extracted.
6. Resume is matched against the job description.
7. Results are displayed and stored in the database.

---

## How to Run Locally

### Backend
```bash
python app.py


#Frontend deployed on Vercel.
