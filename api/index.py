from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import google.generativeai as genai
import os

app = FastAPI()

# 1. Clean CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # Set to False to ensure Safari doesn't block unauthenticated cross-origin calls
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Universal Preflight Catch-all for Safari/Chrome Handshakes
@app.options("/{rest_of_path:path}")
async def preflight_handler(request: Request, rest_of_path: str):
    response = Response()
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS, DELETE, PUT"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

# Configure Gemini
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

# 3. Your Post Route
@app.post("/api/gemini")
async def handle_gemini(request_data: dict):
    try:
        prompt = request_data.get("prompt", "")
        
        if not prompt:
            raise HTTPException(status_code=400, detail="Prompt is required")
            
        # Call the Gemini model
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        
        # Format response structure exactly to mimic what your script.js expects
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
        # Proper FastAPI JSON error formatting
        return JSONResponse(status_code=500, content={"error": str(e)})
