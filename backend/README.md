# EduSummary Backend

FastAPI backend for EduSummary - A RAG-powered textbook summarization system.

## Features

- Upload textbooks (PDF, PPT, DOCX)
- RAG using LangChain + FAISS + GPT4All
- Generate chapter summaries, concept maps, tricks/mnemonics, and Q&A
- Ask free-form questions about uploaded textbooks

## Setup

### 1. Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Download GPT4All Model

The system will automatically download the GPT4All model on first use, or you can manually download:

```bash
mkdir -p models
# Download from: https://gpt4all.io/models/gguf/orca-mini-3b-gguf2-q4_0.gguf
# Place in ./models/ directory
```

### 4. Run the Server

```bash
python main.py
```

Or with uvicorn:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### POST /upload
Upload a textbook file (PDF/PPT/DOCX)

**Request:**
- `file`: Multipart file upload

**Response:**
```json
{
  "status": "success",
  "message": "Textbook processed successfully. System ready.",
  "textbook_name": "example.pdf",
  "total_chunks": 245
}
```

### GET /status
Check system readiness

**Response:**
```json
{
  "ready": true,
  "textbook_name": "example.pdf",
  "total_chunks": 245,
  "message": "System ready"
}
```

### POST /generate
Generate chapter outputs

**Request:**
```json
{
  "chapter": "1",
  "option": "all"  // or "summary", "conceptmap", "tricks"
}
```

**Response:**
```json
{
  "chapter": "1",
  "summary": "...",
  "concept_map": "...",
  "tricks": "...",
  "qna": [
    {"question": "...", "answer": "..."}
  ]
}
```

### POST /ask
Ask a free-form question

**Request:**
```json
{
  "question": "What is photosynthesis?"
}
```

**Response:**
```json
{
  "question": "What is photosynthesis?",
  "answer": "...",
  "sources": ["Chunk 12", "Chunk 34", "Chunk 56"]
}
```

## Project Structure

```
backend/
├── main.py                 # FastAPI application
├── requirements.txt        # Python dependencies
├── models/
│   └── schemas.py         # Pydantic models
├── services/
│   └── rag_service.py     # RAG implementation
├── utils/
│   └── text_extractor.py  # Text extraction utilities
└── storage/
    ├── uploads/           # Uploaded files
    └── faiss_index/       # FAISS vector store
```

## Notes

- First run will download the embeddings model (~300MB) and GPT4All model (~2GB)
- Processing large textbooks (200-300 pages) may take 2-5 minutes
- The system runs entirely locally on CPU
- FAISS index is persisted to disk for quick restarts
