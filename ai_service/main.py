import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

load_dotenv()

app = FastAPI(title="KshetraX AI Service")

# Request Model
class SummarizeRequest(BaseModel):
    transcript: str

# Structured Task Pydantic Schema for LangChain Output
class TaskDetail(BaseModel):
    title: str = Field(description="A short, clear title for the task action item")
    description: str = Field(description="Detailed explanation of what needs to be done")
    due_date: Optional[str] = Field(description="Extracted due date or timeframe if mentioned, otherwise null")
    priority: str = Field(description="Priority rating: high, medium, or low based on urgency")

class AIAnalysisResult(BaseModel):
    summary: str = Field(description="A concise 1-sentence summary of the voice note")
    has_task: bool = Field(description="True if the message contains an actionable work request, false otherwise")
    task: Optional[TaskDetail] = Field(description="Extracted task details if has_task is true, otherwise null")

# Setup LangChain Gemini LLM
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key or "YOUR_GEMINI" in api_key:
    print("⚠️ GOOGLE_API_KEY environment variable not set or contains default placeholder")

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=api_key if api_key and "YOUR_GEMINI" not in api_key else "DUMMY_KEY",
    temperature=0.2
)

parser = JsonOutputParser(pydantic_object=AIAnalysisResult)

prompt_template = ChatPromptTemplate.from_template(
    "Analyze the following construction site voice note transcript. "
    "Summarize the content, determine if there is an actionable task or request, "
    "and extract the task details if present.\n\n"
    "Transcript: {transcript}\n\n"
    "{format_instructions}"
)

@app.post("/api/ai/analyze")
async def analyze_transcript(request: SummarizeRequest):
    if not request.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript cannot be empty")
        
    # If the user has not configured their Google API Key, return a simulated mock analysis
    # This prevents the application from crashing and allows offline testing!
    if not api_key or "YOUR_GEMINI" in api_key or api_key == "DUMMY_KEY":
        print("💡 Simulating offline AI analysis (No API key configured)")
        transcript_lower = request.transcript.lower()
        has_task = any(word in transcript_lower for word in ["need", "require", "order", "fix", "repair", "leak", "damage", "mechanic", "cement", "bricks", "water"])
        
        mock_result = {
            "summary": f"Worker update: {request.transcript[:60]}...",
            "has_task": has_task,
            "task": None
        }
        
        if has_task:
            priority = "high" if any(word in transcript_lower for word in ["leak", "damage", "urgent", "broke", "danger"]) else "medium"
            mock_result["task"] = {
                "title": "Action required: " + request.transcript[:30] + "...",
                "description": request.transcript,
                "due_date": "Today" if "today" in transcript_lower else "Asap",
                "priority": priority
            }
        return mock_result

    try:
        chain = prompt_template | llm | parser
        result = chain.invoke({
            "transcript": request.transcript,
            "format_instructions": parser.get_format_instructions()
        })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
