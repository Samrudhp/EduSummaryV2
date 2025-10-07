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
    GenerateResponse, AskRequest, AskResponse, QnAItem, SectionInfo
)
from services.rag_service import RAGService
from utils.text_extractor import extract_text, chunk_text, extract_sections

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
    """
    Load existing vectorstore on startup if available
    Models are automatically cached and reused from:
    - Embeddings: ~/.cache/huggingface/
    - GPT4All: ~/.cache/gpt4all/
    """
    print("=" * 60)
    print("EduSummary Backend Starting...")
    print("=" * 60)
    
    # Load vectorstore if exists
    rag_service.load_vectorstore()
    
    print("\nModel Cache Locations:")
    print(f"  - HuggingFace models: ~/.cache/huggingface/")
    print(f"  - GPT4All models: ~/.cache/gpt4all/")
    print("\nModels will be downloaded once and cached for future use.")
    print("=" * 60)


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
        
        # Extract text (with page markers for better section detection)
        print(f"Extracting text from {file.filename}...")
        text = extract_text(file_path, file_type)
        
        if not text or len(text) < 100:
            raise HTTPException(
                status_code=400,
                detail="Could not extract sufficient text from the file."
            )
        
        # Extract sections from the document (BEFORE chunking)
        print("Analyzing document structure and extracting sections...")
        sections = extract_sections(text)
        
        if not sections or len(sections) == 0:
            raise HTTPException(
                status_code=400,
                detail="Could not extract any sections from the document."
            )
        
        print(f"✓ Found {len(sections)} sections in document")
        
        # Chunk text (now we chunk the full text with section metadata)
        print("Creating chunks from document...")
        all_chunks = []
        
        # Create chunks for each section separately
        for section in sections:
            section_chunks = chunk_text(
                section['content'], 
                chunk_size=300, 
                overlap=30,
                section_id=section['id'],
                section_title=section['title']
            )
            all_chunks.extend(section_chunks)
        
        print(f"✓ Created {len(all_chunks)} chunks from {len(sections)} sections")
        
        # Create vectorstore
        print("Creating vectorstore...")
        rag_service.create_vectorstore(all_chunks, file.filename, sections)
        
        # Convert sections to response format
        section_infos = [
            SectionInfo(id=s["id"], title=s["title"], preview=s["preview"])
            for s in sections
        ]
        
        return UploadResponse(
            status="success",
            message="Textbook processed successfully. System ready.",
            textbook_name=file.filename,
            total_chunks=len(all_chunks),
            sections=section_infos
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
    
    # Convert sections to response format
    section_infos = None
    if status.get('sections'):
        section_infos = [
            SectionInfo(id=s["id"], title=s["title"], preview=s["preview"])
            for s in status['sections']
        ]
    
    return StatusResponse(
        ready=status['ready'],
        textbook_name=status.get('textbook_name'),
        total_chunks=status.get('total_chunks'),
        sections=section_infos,
        message="System ready" if status['ready'] else "No textbook uploaded"
    )


@app.post("/generate", response_model=GenerateResponse)
async def generate_outputs(request: GenerateRequest):
    """
    Generate section outputs (summary, concept map, tricks, Q&A)
    """
    if not rag_service.is_ready():
        raise HTTPException(
            status_code=400,
            detail="System not ready. Please upload a textbook first."
        )
    
    try:
        option = request.option.lower()
        section_id = request.section_id
        
        # Get section title
        section = rag_service.get_section_info(section_id)
        section_title = section['title'] if section else section_id
        
        response_data = {"section_id": section_id, "section_title": section_title}
        
        if option == "summary" or option == "all":
            print(f"Generating summary for section {section_id}...")
            response_data["summary"] = rag_service.generate_summary(section_id)
        
        if option == "conceptmap" or option == "all":
            print(f"Generating concept map for section {section_id}...")
            response_data["concept_map"] = rag_service.generate_concept_map(section_id)
        
        if option == "tricks" or option == "all":
            print(f"Generating tricks for section {section_id}...")
            response_data["tricks"] = rag_service.generate_tricks(section_id)
        
        if option == "all":
            print(f"Generating Q&A for section {section_id}...")
            qna_list = rag_service.generate_qna(section_id)
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
