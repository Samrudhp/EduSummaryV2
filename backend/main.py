"""
FastAPI Backend for EduSummary
"""
import os
import shutil
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from models.schemas import (
    UploadResponse, StatusResponse, GenerateRequest, 
    GenerateResponse, AskRequest, AskResponse, QnAItem
)
from services.rag_service import RAGService
from utils.text_extractor import extract_text, chunk_text

# Initialize FastAPI app
app = FastAPI(title="EduSummary API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG service
rag_service = RAGService()

# Storage directory
UPLOAD_DIR = "./storage/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.on_event("startup")
async def startup_event():
    """Load existing vectorstore on startup if available"""
    rag_service.load_vectorstore()


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "EduSummary API is running!", "version": "1.0.0"}


@app.post("/upload", response_model=UploadResponse)
async def upload_textbook(file: UploadFile = File(...)):
    """
    Upload and process textbook (PDF/PPT/DOCX)
    """
    try:
        # Validate file type
        filename = file.filename.lower()
        if filename.endswith('.pdf'):
            file_type = 'pdf'
        elif filename.endswith('.pptx') or filename.endswith('.ppt'):
            file_type = 'pptx'
        elif filename.endswith('.docx') or filename.endswith('.doc'):
            file_type = 'docx'
        else:
            raise HTTPException(
                status_code=400, 
                detail="Unsupported file type. Please upload PDF, PPT, or DOCX."
            )
        
        # Save uploaded file
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Extract text
        print(f"Extracting text from {file.filename}...")
        text = extract_text(file_path, file_type)
        
        if not text or len(text) < 100:
            raise HTTPException(
                status_code=400,
                detail="Could not extract sufficient text from the file."
            )
        
        # Chunk text
        print("Chunking text...")
        chunks = chunk_text(text, chunk_size=500, overlap=50)
        
        # Create vectorstore
        print("Creating vectorstore...")
        rag_service.create_vectorstore(chunks, file.filename)
        
        return UploadResponse(
            status="success",
            message="Textbook processed successfully. System ready.",
            textbook_name=file.filename,
            total_chunks=len(chunks)
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in upload: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


@app.get("/status", response_model=StatusResponse)
async def get_status():
    """
    Get system status
    """
    status = rag_service.get_status()
    return StatusResponse(
        ready=status['ready'],
        textbook_name=status.get('textbook_name'),
        total_chunks=status.get('total_chunks'),
        message="System ready" if status['ready'] else "No textbook uploaded"
    )


@app.post("/generate", response_model=GenerateResponse)
async def generate_outputs(request: GenerateRequest):
    """
    Generate chapter outputs (summary, concept map, tricks, Q&A)
    """
    if not rag_service.is_ready():
        raise HTTPException(
            status_code=400,
            detail="System not ready. Please upload a textbook first."
        )
    
    try:
        option = request.option.lower()
        chapter = request.chapter
        
        response_data = {"chapter": chapter}
        
        if option == "summary" or option == "all":
            print(f"Generating summary for chapter {chapter}...")
            response_data["summary"] = rag_service.generate_summary(chapter)
        
        if option == "conceptmap" or option == "all":
            print(f"Generating concept map for chapter {chapter}...")
            response_data["concept_map"] = rag_service.generate_concept_map(chapter)
        
        if option == "tricks" or option == "all":
            print(f"Generating tricks for chapter {chapter}...")
            response_data["tricks"] = rag_service.generate_tricks(chapter)
        
        if option == "all":
            print(f"Generating Q&A for chapter {chapter}...")
            qna_list = rag_service.generate_qna(chapter)
            response_data["qna"] = [QnAItem(**item) for item in qna_list]
        
        return GenerateResponse(**response_data)
    
    except Exception as e:
        print(f"Error in generate: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating output: {str(e)}")


@app.post("/ask", response_model=AskResponse)
async def ask_question(request: AskRequest):
    """
    Ask a free-form question about the textbook
    """
    if not rag_service.is_ready():
        raise HTTPException(
            status_code=400,
            detail="System not ready. Please upload a textbook first."
        )
    
    try:
        print(f"Answering question: {request.question}")
        result = rag_service.ask_question(request.question)
        
        return AskResponse(
            question=request.question,
            answer=result['answer'],
            sources=result.get('sources')
        )
    
    except Exception as e:
        print(f"Error in ask: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error answering question: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
