from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
import os

# Load environment variables
load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Load Gemini model
model = genai.GenerativeModel("gemini-2.5-flash")

# Create FastAPI app
app = FastAPI()


# ---------------- HOME ----------------

@app.get("/")
def home():
    return {
        "message": "Welcome to AI Interview Coach 🚀"
    }


# ---------------- TEST GEMINI ----------------

@app.get("/test")
def test():
    response = model.generate_content(
        "Say hello to the AI Interview Coach."
    )

    return {
        "response": response.text
    }


# ---------------- START INTERVIEW ----------------

class InterviewRequest(BaseModel):
    role: str


@app.post("/start")
def start_interview(request: InterviewRequest):

    prompt = f"""
You are an experienced technical interviewer.

The candidate is applying for the role of {request.role}.

Ask ONLY ONE interview question.

Do not provide the answer.

Only ask the question.
"""

    response = model.generate_content(prompt)

    return {
        "question": response.text
    }


# ---------------- EVALUATE ANSWER ----------------

class AnswerRequest(BaseModel):
    role: str
    question: str
    answer: str


@app.post("/answer")
def evaluate_answer(request: AnswerRequest):

    prompt = f"""
You are an experienced technical interviewer.

Candidate Role:
{request.role}

Interview Question:
{request.question}

Candidate Answer:
{request.answer}

Evaluate the answer.

Return in the following format.

Score: x/10

Strengths:
- Point 1
- Point 2

Weaknesses:
- Point 1
- Point 2

Improved Answer:
Write a better interview answer.

Next Question:
Ask ONE new interview question.
"""

    response = model.generate_content(prompt)

    return {
        "evaluation": response.text
    }