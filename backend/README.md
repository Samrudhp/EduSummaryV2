# EduSummary Backend

FastAPI backend for EduSummary - A RAG-powered textbook summarization system.

## Features

- Upload textbooks (PDF, PPT, DOCX)
- RAG using LangChain + FAISS + GPT4All
- Generate chapter summaries, concept maps, tricks/mnemonics, and Q&A
- Ask free-form questions about uploaded textbooks

## Setup

### 1. Create Virtual Environment

**Using pyenv (Recommended):**
```bash
# Set Python version with pyenv
pyenv shell 3.10.11  # or your preferred version

# Create venv with pyenv Python
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

**Using system Python:**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

**Note:** The `start-backend.sh` script automatically detects and uses pyenv Python if available.

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Model Caching (Automatic)

**Important:** Models are automatically downloaded and cached on first use. They will NOT be re-downloaded in future runs.

**Cache Locations:**
- **Embeddings Model** (~300MB): `~/.cache/huggingface/`
- **GPT4All Model** (~2GB): `~/.cache/gpt4all/`

**First Run:** Downloads models (one-time, ~10-15 minutes)
**Subsequent Runs:** Uses cached models (instant loading)

#### Optional: Pre-download Models

To download models before starting the server:

```bash
python setup_models.py
```

This will:
- ✅ Download and cache the embeddings model
- ✅ Download and cache the GPT4All model
- ✅ Verify everything is ready

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
├── setup_models.py         # Pre-download models script
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

- **Model Caching**: Models are downloaded ONCE and cached in `~/.cache/`
  - Embeddings: `~/.cache/huggingface/` (~300MB)
  - GPT4All: `~/.cache/gpt4all/` (~2GB)
- **First run**: Downloads models (10-15 minutes, one-time only)
- **Subsequent runs**: Uses cached models (instant, no re-download)
- Processing large textbooks (200-300 pages) may take 2-5 minutes
- The system runs entirely locally on CPU
- FAISS index is persisted to disk for quick restarts

## Troubleshooting

### Models Keep Re-downloading?

If models seem to re-download, check:

```bash
# Check if cache directories exist
ls -la ~/.cache/huggingface/
ls -la ~/.cache/gpt4all/

# If directories are missing, run setup script
python setup_models.py
```

### Clear Model Cache (if needed)

```bash
# Clear embeddings cache
rm -rf ~/.cache/huggingface/

# Clear GPT4All cache
rm -rf ~/.cache/gpt4all/

# Re-download
python setup_models.py
```
