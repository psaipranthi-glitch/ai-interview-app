from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# 2. Universal Preflight Catch-all (Overriding default options block smoothly)
@app.options("/{rest_of_path:path}")
async def preflight_handler(request: Request, rest_of_path: str):
    response = Response()
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS, DELETE, PUT"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

@app.post("/api/gemini")
async def handle_gemini(request_data: dict):
    try:
        prompt = request_data.get("prompt", "")
        
        # Call the Gemini model
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        
        # Format the response to exactly mimic the Google API structure your script.js expects
        return {
            "candidates": [
                {
                    "content": {
                        "parts": [
                            {
                                "text": response.text
                            }
                        ]
                    }
                }
            ]
        }
    except Exception as e:
        return {"error": str(e)}, 500
