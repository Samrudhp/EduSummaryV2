# 📚 EduSummary - RAG-Powered Textbook Learning Assistant

A fully functional, **100% local** application that processes textbooks and generates intelligent summaries, concept maps, memory tricks, and Q&A using **RAG (Retrieval-Augmented Generation)** with LangChain, FAISS, and GPT4All.

## ✨ Features

- 📁 **Upload Textbooks** - Support for PDF, PPT, and DOCX files
- 📝 **Chapter Summaries** - AI-generated comprehensive summaries
- 🗺️ **Concept Maps** - Hierarchical concept relationships
- 💡 **Memory Tricks** - Mnemonics and learning aids
- ❓ **Q&A Generation** - Automatic question-answer pairs
- 🤔 **Free Questions** - Ask anything about your textbook
- 🔒 **100% Local** - All processing happens on your machine
- ⚡ **Persistent Storage** - FAISS index saved for quick restarts

## 🏗️ Architecture

### Backend (FastAPI + LangChain)
- **Framework**: FastAPI
- **RAG Pipeline**: LangChain
- **Vector Store**: FAISS (CPU-optimized)
- **LLM**: GPT4All-MPT (local inference)
- **Embeddings**: all-mpnet-base-v2 (~300MB)
- **Text Extraction**: PyPDF2, pdfplumber, python-pptx, python-docx

### Frontend (React + Vite)
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Pure CSS (no frameworks)
- **API Integration**: Fetch API

## 🚀 Quick Start

### Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- 8GB+ RAM recommended
- 5GB+ free disk space (for models)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

Backend will be available at `http://localhost:8000`

**Note**: First run will download:
- Sentence transformers model (~300MB)
- GPT4All model (~2GB)

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 📖 Usage

### 1. Upload a Textbook

- Drag & drop or browse for a PDF, PPT, or DOCX file
- Wait 2-5 minutes for processing (depending on file size)
- System will extract text, chunk it, and create embeddings

### 2. Generate Chapter Content

- Enter chapter number (e.g., "1", "2", "Introduction")
- Select output type:
  - **Summary** - Comprehensive chapter summary
  - **Concept Map** - Hierarchical concept structure
  - **Tricks** - Memory aids and mnemonics
  - **All** - Everything including Q&A pairs

### 3. Ask Questions

- Type any question about the textbook
- AI will search relevant sections and provide answers
- Sources are displayed for transparency

## 📂 Project Structure

```
EduSummaryV2/
├── backend/
│   ├── main.py                    # FastAPI application
│   ├── requirements.txt           # Python dependencies
│   ├── models/
│   │   └── schemas.py            # Pydantic models
│   ├── services/
│   │   └── rag_service.py        # RAG implementation
│   ├── utils/
│   │   └── text_extractor.py     # Text extraction utilities
│   └── storage/
│       ├── uploads/              # Uploaded files
│       └── faiss_index/          # Vector store
│
├── frontend/
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── api.js               # Backend API integration
│   │   ├── App.jsx              # Main app
│   │   └── App.css              # Styles
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🔧 Configuration

### Backend Configuration

Edit `backend/services/rag_service.py`:

```python
# Change chunk size
chunk_text(text, chunk_size=500, overlap=50)

# Change retrieval settings
retriever = self.vectorstore.as_retriever(search_kwargs={"k": 5})

# Change LLM parameters
self.llm = GPT4All(
    model=model_file,
    max_tokens=2048,
    temp=0.7,
)
```

### Frontend Configuration

Edit `frontend/src/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:8000';
```

## 🧪 API Endpoints

### POST /upload
Upload and process textbook

**Request**: Multipart file upload

**Response**:
```json
{
  "status": "success",
  "message": "Textbook processed successfully",
  "textbook_name": "example.pdf",
  "total_chunks": 245
}
```

### GET /status
Check system readiness

**Response**:
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

**Request**:
```json
{
  "chapter": "1",
  "option": "all"
}
```

**Response**:
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
Ask a question

**Request**:
```json
{
  "question": "What is photosynthesis?"
}
```

**Response**:
```json
{
  "question": "What is photosynthesis?",
  "answer": "...",
  "sources": ["Chunk 12", "Chunk 34"]
}
```

## 🎯 Performance

- **Textbook Size**: Handles 200-300 page textbooks
- **Processing Time**: 2-5 minutes for initial upload
- **Generation Time**: 30-60 seconds per output
- **CPU Usage**: Optimized for CPU-only systems
- **RAM Usage**: ~4-6GB during processing

## 🔐 Privacy & Security

- ✅ All data stays local on your machine
- ✅ No internet required after initial setup
- ✅ No data sent to external servers
- ✅ FAISS index persisted locally
- ✅ Full control over your textbooks

## 🐛 Troubleshooting

### Backend Issues

**Import errors**: Make sure virtual environment is activated
```bash
source venv/bin/activate
pip install -r requirements.txt
```

**Model download fails**: Check internet connection and disk space

**Out of memory**: Reduce chunk size or use smaller textbooks

### Frontend Issues

**API connection fails**: Ensure backend is running on port 8000

**Build errors**: Clear node_modules and reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📝 License

MIT License - Feel free to use and modify!

## 🤝 Contributing

Contributions welcome! Please open issues or submit PRs.

## 📧 Support

For issues or questions, please open a GitHub issue.

---

**Built with ❤️ using LangChain, FAISS, GPT4All, FastAPI, and React**
