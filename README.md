# 🎓 EduSummary V2 - RAG-Powered Educational Content Generator

> **AI-driven educational content generation using Retrieval-Augmented Generation (RAG) for intelligent, context-aware learning materials**

[![Python](https://img.shields.io/badge/Python-3.10-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![LangChain](https://img.shields.io/badge/LangChain-Latest-orange.svg)](https://www.langchain.com/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [How RAG Works in EduSummary](#how-rag-works-in-edusummary)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Advanced Features](#advanced-features)
- [Contributing](#contributing)

---

## 🎯 Overview

**EduSummary V2** is an advanced educational platform that leverages **Retrieval-Augmented Generation (RAG)** to transform educational documents (PDFs, PPTX, DOCX) into comprehensive learning materials. The system intelligently extracts document structure, creates semantic embeddings, and generates targeted educational content including summaries, concept maps, and memory tricks.

### What Makes It Special?

- **🧠 Intelligent Section Detection**: SOTA algorithms detect document structure automatically
- **🔍 RAG-Powered Generation**: Context-aware content generation using document embeddings
- **📚 Multi-Format Support**: PDF, PowerPoint, Word documents
- **🎨 Beautiful UI**: Glassmorphic design with intuitive section selection
- **⚡ Fast & Efficient**: FAISS vector search with optimized retrieval
- **🎯 Section-Specific**: Generate content for specific sections or entire documents

---

## 🔬 How RAG Works in EduSummary

### The RAG Pipeline

**RAG (Retrieval-Augmented Generation)** combines the power of information retrieval with large language models to generate accurate, context-grounded responses. Here's how it works in EduSummary:

```
┌─────────────────────────────────────────────────────────────────┐
│                    1. DOCUMENT INGESTION                         │
│  User uploads PDF/PPTX/DOCX → Text Extraction → Section Detection│
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    2. CHUNKING & EMBEDDING                       │
│  Sections → Smart Chunks (300 tokens) → Sentence Embeddings      │
│  Model: sentence-transformers/all-mpnet-base-v2                  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    3. VECTOR STORAGE (FAISS)                     │
│  Chunks stored with metadata: {section_id, section_title, text} │
│  Fast similarity search using L2 distance                        │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    4. RETRIEVAL (Query Time)                     │
│  User selects section → Filter by section_id → Retrieve top-k   │
│  Context: Most relevant chunks (k=3) → Max 800 chars each       │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    5. GENERATION (LLM)                           │
│  Context + Prompt → GPT4All-MPT → Structured Output             │
│  Types: Summary | Concept Map | Memory Tricks | Q&A             │
└─────────────────────────────────────────────────────────────────┘
```

### Why RAG?

1. **Grounded Responses**: Content is based on actual document text, not hallucinations
2. **Scalability**: Works with documents of any size (chunks handle large files)
3. **Relevance**: Retrieval ensures only pertinent information is used
4. **Efficiency**: No need to feed entire document to LLM (saves tokens & time)
5. **Accuracy**: Section-filtering ensures context is from the right part of the document

### The RAG Advantage Over Traditional LLMs

| Aspect | Traditional LLM | RAG (EduSummary) |
|--------|----------------|------------------|
| **Context Window** | Limited (4K-32K tokens) | Unlimited (retrieves what's needed) |
| **Hallucinations** | Common | Minimized (grounded in source) |
| **Document Size** | Must fit in context | Any size (chunked) |
| **Accuracy** | General knowledge | Specific to uploaded document |
| **Speed** | Slow for large docs | Fast (retrieves only k chunks) |
| **Cost** | High token usage | Optimized (small context) |

---

## 🏗️ Architecture

### System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                       │
│  ┌────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │
│  │  Upload Page   │  │ Content Generator │  │  Section Sidebar │    │
│  │   (Dropzone)   │  │   (Multi-select)  │  │   (Smart Cards)  │    │
│  └────────┬───────┘  └────────┬─────────┘  └────────┬─────────┘    │
│           │                   │                      │               │
│           └───────────────────┴──────────────────────┘               │
│                              │                                       │
│                         API Layer (Axios)                            │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
                               ▼ HTTP/REST
┌──────────────────────────────────────────────────────────────────────┐
│                       BACKEND (FastAPI)                               │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                      API Endpoints                            │   │
│  │  /upload  |  /status  |  /generate  |  /list                │   │
│  └───────────┬──────────────────────────────────────────────────┘   │
│              │                                                        │
│  ┌───────────▼────────────────────────────────────────────────────┐ │
│  │                   Business Logic Layer                         │ │
│  │  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────┐ │ │
│  │  │ Text Extractor  │  │   RAG Service    │  │  Validators  │ │ │
│  │  │  (SOTA Section  │  │  (LangChain)     │  │   (Pydantic) │ │ │
│  │  │   Detection)    │  │                  │  │              │ │ │
│  │  └────────┬────────┘  └────────┬─────────┘  └──────────────┘ │ │
│  └───────────┼──────────────────────┼──────────────────────────────┘ │
│              │                      │                                │
│  ┌───────────▼──────────────────────▼──────────────────────────────┐ │
│  │                    Data Processing Pipeline                      │ │
│  │                                                                  │ │
│  │  1. Extract Text (PyPDF2/pdfplumber/python-pptx/python-docx)   │ │
│  │  2. Detect Sections (Multi-pattern regex + confidence scoring)  │ │
│  │  3. Chunk Text (300 tokens, 30 overlap, section-aware)         │ │
│  │  4. Generate Embeddings (sentence-transformers/all-mpnet)       │ │
│  │  5. Store Vectors (FAISS with metadata)                        │ │
│  │                                                                  │ │
│  └───────────┬──────────────────────────────────────────────────────┘ │
│              │                                                        │
│  ┌───────────▼──────────────────────────────────────────────────────┐ │
│  │                    Storage & Retrieval Layer                     │ │
│  │                                                                  │ │
│  │  ┌──────────────────┐      ┌───────────────────────────────┐   │ │
│  │  │  FAISS Vector DB │      │  Local File System           │   │ │
│  │  │  - Embeddings    │      │  - vectorstore/              │   │ │
│  │  │  - Metadata      │      │    ├── index.faiss           │   │ │
│  │  │  - L2 Distance   │      │    └── metadata.pkl          │   │ │
│  │  └──────────────────┘      └───────────────────────────────┘   │ │
│  │                                                                  │ │
│  └───────────┬──────────────────────────────────────────────────────┘ │
│              │                                                        │
│  ┌───────────▼──────────────────────────────────────────────────────┐ │
│  │                    LLM Generation Layer                          │ │
│  │                                                                  │ │
│  │  ┌─────────────────────────────────────────────────────────┐   │ │
│  │  │  GPT4All-MPT-7B (Local Model)                           │   │ │
│  │  │  - Prompt Templates (Summary/ConceptMap/Tricks/QnA)     │   │ │
│  │  │  - Context Injection (Retrieved chunks)                 │   │ │
│  │  │  - Streaming Support                                     │   │ │
│  │  └─────────────────────────────────────────────────────────┘   │ │
│  │                                                                  │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### 🎨 Frontend Architecture

```
src/
├── components/
│   ├── Upload.jsx              # File upload with drag-drop
│   ├── ContentGenerator.jsx    # Main content generation interface
│   │   ├── Sidebar: Section list with multi-select
│   │   ├── Main: Content type cards + generation
│   │   └── Results: Grouped by section
│   └── ContentGenerator.css    # Glassmorphic design
├── api.js                      # Axios HTTP client
└── App.jsx                     # Router & state management
```

**Key Features:**
- **Responsive Grid Layout**: 320px sidebar + flexible main area
- **Multi-Section Selection**: Checkbox-based selection with visual feedback
- **Content Type Cards**: Summary, Concept Map, Memory Tricks
- **Real-time Generation**: Progress indicators for multi-section processing

#### ⚙️ Backend Architecture

```
backend/
├── main.py                     # FastAPI application & endpoints
├── services/
│   └── rag_service.py          # RAG pipeline implementation
│       ├── create_vectorstore()    # Build FAISS index
│       ├── load_vectorstore()      # Load existing index
│       ├── retrieve_context()      # Section-filtered retrieval
│       └── generate_*()            # Content generation methods
├── utils/
│   └── text_extractor.py       # Document processing
│       ├── extract_from_pdf()      # PDF text extraction
│       ├── extract_from_pptx()     # PowerPoint extraction
│       ├── extract_from_docx()     # Word extraction
│       └── extract_sections()      # SOTA section detection
└── models/
    └── schemas.py              # Pydantic models for validation
```

**Key Services:**

1. **RAGService** (`rag_service.py`):
   - Manages entire RAG pipeline
   - Handles vectorstore creation and loading
   - Implements section-aware retrieval
   - Generates 4 types of educational content

2. **TextExtractor** (`text_extractor.py`):
   - Multi-format document parsing
   - 5-phase intelligent section detection
   - Section-aware text chunking
   - Metadata preservation

---

## ✨ Key Features

### 🔍 SOTA Section Detection (5-Phase Algorithm)

**Phase 1: Text Cleaning & Normalization**
- Filters metadata (emails, URLs, DOIs, ISSNs)
- Extracts line features (length, word count, case patterns)
- Tracks page boundaries for context

**Phase 2: Heading Detection with Confidence Scoring**
- Academic sections (Abstract, Introduction, Methods, Results, etc.) → Score: 10
- Numbered sections (Chapter 1, Section 2.3) → Score: 9-10
- ALL CAPS headings (validated) → Score: 7
- Title Case detection → Score: 6
- Short capitalized lines → Score: 5

**Phase 3: Heading Validation & Filtering**
- Removes duplicates and proximate headings
- Verifies content follows headings
- Score-based ranking

**Phase 4: Section Construction**
- Content extraction between headings
- Minimum content validation (>100 chars)
- Preview generation (250 chars)

**Phase 5: Intelligent Fallback**
- Paragraph-based segmentation
- Semantic boundary detection
- Optimal section calculation (3-8 sections)
- Meaningful title extraction

### 📊 Content Generation Types

1. **Summary**: Concise overview of section content
2. **Concept Map**: Key concepts and relationships
3. **Memory Tricks**: Mnemonics and learning aids
4. **Q&A**: Questions and answers (future feature)

### 🎯 Section-Aware RAG

Traditional RAG retrieves from entire document. EduSummary:
- **Filters by section_id** before retrieval
- **Retrieves k×3 chunks** then filters to k chunks from target section
- **Preserves context** by including section title in metadata
- **Accurate generation** based on specific section content

---

## 🛠️ Technology Stack

### Backend
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | FastAPI | High-performance async API |
| **LLM** | GPT4All-MPT-7B | Local language model |
| **Embeddings** | sentence-transformers/all-mpnet-base-v2 | Semantic text embeddings |
| **Vector DB** | FAISS | Fast similarity search |
| **RAG Framework** | LangChain | RAG pipeline orchestration |
| **PDF Parser** | PyPDF2, pdfplumber | PDF text extraction |
| **PPTX Parser** | python-pptx | PowerPoint extraction |
| **DOCX Parser** | python-docx | Word document extraction |
| **Validation** | Pydantic | Request/response validation |

### Frontend
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | React 18 | UI components |
| **Build Tool** | Vite | Fast development & bundling |
| **HTTP Client** | Axios | API communication |
| **Styling** | CSS3 (Glassmorphism) | Modern UI design |
| **Icons** | Heroicons (SVG) | UI iconography |

---

## 🚀 Installation

### Prerequisites

- **Python**: 3.10 or higher
- **Node.js**: 16 or higher
- **npm**: 8 or higher
- **Git**: For cloning the repository

### Clone Repository

```bash
git clone https://github.com/Samrudhp/EduSummaryV2.git
cd EduSummaryV2
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3.10 -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

The backend will start at `http://localhost:8000`

**First Run Note**: The system will automatically download:
- GPT4All MPT-7B model (~4.8 GB)
- Sentence transformer model (~420 MB)

These are cached for future use.

### Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start at `http://localhost:5173`

---

## 📖 Usage

### 1. Upload Document

1. Open `http://localhost:5173`
2. Click **"Choose a file"** or drag & drop
3. Supported formats: PDF, PPTX, DOCX
4. Wait for processing (~5-30 seconds depending on size)

### 2. Review Detected Sections

- Sidebar shows all detected sections
- Each section displays:
  - **Number badge**: Section index
  - **Title**: Detected or extracted heading
  - **Preview**: First 80 characters of content

### 3. Select Sections

- Click on section cards to select/deselect
- Use **"Select All"** / **"Deselect All"** for bulk actions
- Selected sections are highlighted with gradient

### 4. Choose Content Types

- **Summary**: ✓ Enabled by default
- **Concept Map**: Educational concept relationships
- **Memory Tricks**: Mnemonics and learning aids

### 5. Generate Content

- Click **"Generate Content"** button
- View real-time progress
- Results are grouped by section
- **Copy to clipboard** with one click

---

## 📡 API Documentation

### Base URL: `http://localhost:8000`

### Endpoints

#### 1. Upload Document

```http
POST /upload
Content-Type: multipart/form-data
```

**Request:**
```bash
curl -X POST "http://localhost:8000/upload" \
  -F "file=@document.pdf"
```

**Response:**
```json
{
  "filename": "document.pdf",
  "status": "success",
  "message": "File uploaded and processed successfully",
  "sections": [
    {
      "id": "section_0",
      "title": "Introduction",
      "preview": "This paper presents a novel approach to..."
    }
  ]
}
```

#### 2. Check Status

```http
GET /status
```

**Response:**
```json
{
  "status": "ready",
  "message": "Vectorstore loaded successfully",
  "has_data": true,
  "sections": [...]
}
```

#### 3. Generate Content

```http
POST /generate
Content-Type: application/json
```

**Request:**
```json
{
  "section_id": "section_0",
  "content_type": "summary"
}
```

**Response:**
```json
{
  "section_id": "section_0",
  "section_title": "Introduction",
  "content_type": "summary",
  "summary": "This section introduces the concept of attention mechanisms..."
}
```

**Content Types**: `summary`, `conceptmap`, `tricks`, `qna`

#### 4. List Uploaded Files

```http
GET /list
```

**Response:**
```json
{
  "files": [
    {
      "name": "document.pdf",
      "size": 1024000,
      "uploaded_at": "2025-10-07T10:30:00"
    }
  ]
}
```

---

## 📁 Project Structure

```
EduSummaryV2/
├── backend/
│   ├── main.py                      # FastAPI application
│   ├── requirements.txt             # Python dependencies
│   ├── services/
│   │   └── rag_service.py           # RAG implementation
│   ├── utils/
│   │   └── text_extractor.py        # Document processing
│   ├── models/
│   │   └── schemas.py               # Pydantic models
│   ├── uploads/                     # Uploaded documents
│   ├── vectorstore/                 # FAISS indices
│   └── venv/                        # Virtual environment
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Upload.jsx
│   │   │   ├── ContentGenerator.jsx
│   │   │   └── ContentGenerator.css
│   │   ├── api.js                   # API client
│   │   ├── App.jsx                  # Main app
│   │   └── main.jsx                 # Entry point
│   ├── package.json                 # Node dependencies
│   └── vite.config.js               # Vite configuration
│
└── README.md                         # This file
```

---

## 🔬 Advanced Features

### Section-Filtered Retrieval Algorithm

```python
def retrieve_context(self, query: str, section_id: str = None, k: int = 3):
    """
    Retrieves most relevant chunks with section filtering
    
    Algorithm:
    1. If section_id provided:
       - Retrieve k×3 chunks (e.g., 9 chunks)
       - Filter to keep only chunks from target section
       - Return top k chunks (e.g., 3 chunks)
    2. Else:
       - Return top k chunks from all sections
    3. Limit each chunk to 800 characters
    """
```

### Embedding Model Details

**Model**: `sentence-transformers/all-mpnet-base-v2`
- **Dimensions**: 768
- **Max Sequence**: 384 tokens
- **Performance**: State-of-the-art on semantic similarity tasks
- **Speed**: ~2000 sentences/sec on GPU, ~200/sec on CPU

### Chunking Strategy

```python
chunk_size = 300      # tokens per chunk
chunk_overlap = 30    # token overlap between chunks
```

**Why these values?**
- 300 tokens ≈ 1-2 paragraphs (semantic coherence)
- 30 token overlap preserves context at boundaries
- Fits well within embedding model's 384 token limit

---

## 🎨 UI/UX Features

### Glassmorphic Design

- **Frosted glass effect**: `backdrop-filter: blur(10px)`
- **Gradient backgrounds**: Smooth color transitions
- **Smooth animations**: 0.3s transitions on interactions
- **Responsive layout**: Works on desktop and tablet

### Accessibility

- **Keyboard navigation**: Full keyboard support
- **ARIA labels**: Screen reader friendly
- **High contrast**: WCAG AA compliant
- **Focus indicators**: Visible focus states

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Model download fails
```bash
# Solution: Manually download models
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-mpnet-base-v2')"
```

**Problem**: FAISS import error
```bash
# Solution: Reinstall faiss
pip uninstall faiss-cpu faiss-gpu
pip install faiss-cpu
```

### Frontend Issues

**Problem**: CORS errors
```bash
# Solution: Check backend CORS settings in main.py
# Ensure frontend URL is in allowed origins
```

**Problem**: Vite port conflict
```bash
# Solution: Change port in vite.config.js or use:
npm run dev -- --port 3000
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use ESLint for JavaScript code
- Write descriptive commit messages
- Add tests for new features
- Update documentation

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgements

- **LangChain**: RAG framework
- **FAISS**: Vector similarity search
- **GPT4All**: Local LLM
- **Sentence Transformers**: Embedding models
- **FastAPI**: Modern Python web framework
- **React**: UI library

---

## 📧 Contact

**Samrudh P**  
GitHub: [@Samrudhp](https://github.com/Samrudhp)  
Project Link: [https://github.com/Samrudhp/EduSummaryV2](https://github.com/Samrudhp/EduSummaryV2)

---

## 🗺️ Roadmap

- [ ] Add Q&A generation endpoint
- [ ] Support for more document formats (Markdown, TXT, EPUB)
- [ ] Multi-language support
- [ ] Export to PDF/DOCX
- [ ] Collaborative features (sharing, comments)
- [ ] Custom LLM integration (OpenAI, Anthropic)
- [ ] Advanced analytics (reading time, complexity metrics)
- [ ] Mobile app (React Native)

---

<div align="center">

**Made with ❤️ by Samrudh P**

⭐ Star this repository if you find it helpful!

</div>
