# 🚀 EduSummary Setup Guide

Complete step-by-step guide to get EduSummary running on your machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.11+** 
  ```bash
  python3 --version
  ```

- **Node.js 18+**
  ```bash
  node --version
  ```

- **Git** (to clone the repository)
  ```bash
  git --version
  ```

## 🔧 Installation

### Method 1: Using Startup Scripts (Recommended)

#### 1. Start Backend

```bash
./start-backend.sh
```

This script will:
- ✅ Create virtual environment
- ✅ Install Python dependencies
- ✅ Create necessary directories
- ✅ Start FastAPI server on port 8000

**First run**: Downloads will take 10-15 minutes (~2.3GB)
- Sentence transformers model (~300MB)
- GPT4All model (~2GB)

#### 2. Start Frontend (in a new terminal)

```bash
./start-frontend.sh
```

This script will:
- ✅ Install npm dependencies
- ✅ Start Vite dev server on port 5173

---

### Method 2: Manual Setup

#### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Create directories
mkdir -p storage/uploads
mkdir -p models

# Run server
python main.py
```

**Backend will be running at**: `http://localhost:8000`
**API Documentation**: `http://localhost:8000/docs`

#### Frontend Setup

```bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

**Frontend will be running at**: `http://localhost:5173`

---

## 🎯 Quick Start Guide

### 1. Access the Application

Open your browser and go to: `http://localhost:5173`

### 2. Upload a Textbook

1. Click on the upload area or drag & drop a file
2. Supported formats: PDF, PPT, DOCX
3. Wait for processing (2-5 minutes for 200-300 page books)
4. You'll see "System ready" when complete

### 3. Generate Content

**Option A: Chapter Analysis**
1. Enter chapter number (e.g., "1", "Introduction")
2. Select output type:
   - Summary
   - Concept Map
   - Tricks & Mnemonics
   - All (includes Q&A)
3. Click "Generate"
4. Wait 30-60 seconds
5. View results in tabs

**Option B: Ask Questions**
1. Type your question in the text area
2. Click "Ask Question"
3. Get AI-powered answers with sources

---

## 📁 Directory Structure

After setup, your project should look like this:

```
EduSummaryV2/
├── backend/
│   ├── venv/                      # Python virtual environment
│   ├── storage/
│   │   ├── uploads/              # Your uploaded textbooks
│   │   └── faiss_index/          # Vector store (auto-generated)
│   ├── models/
│   │   └── *.gguf                # GPT4All model (auto-downloaded)
│   ├── main.py
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   ├── node_modules/             # npm dependencies
│   ├── src/
│   ├── package.json
│   └── ...
│
├── start-backend.sh              # Backend startup script
├── start-frontend.sh             # Frontend startup script
└── README.md
```

---

## 🔍 Verification

### Check Backend is Running

```bash
curl http://localhost:8000
```

Expected response:
```json
{"message": "EduSummary API is running!", "version": "1.0.0"}
```

### Check Frontend is Running

Open browser to `http://localhost:5173`

You should see the EduSummary welcome screen.

---

## ⚙️ Configuration

### Change Backend Port

Edit `backend/main.py` (last line):
```python
uvicorn.run(app, host="0.0.0.0", port=8000)  # Change 8000 to your port
```

Then update `frontend/src/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:YOUR_PORT';
```

### Change Frontend Port

Edit `frontend/vite.config.js`:
```javascript
export default defineConfig({
  server: {
    port: 5173  // Change to your port
  }
})
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError`
```bash
# Solution: Activate virtual environment
source backend/venv/bin/activate
pip install -r backend/requirements.txt
```

**Problem**: `Port 8000 already in use`
```bash
# Solution: Kill process using port 8000
lsof -ti:8000 | xargs kill -9
```

**Problem**: Out of memory during processing
```bash
# Solution: Reduce chunk size in backend/utils/text_extractor.py
chunk_text(text, chunk_size=300, overlap=30)  # Reduced from 500
```

**Problem**: Model download fails
```bash
# Solution: Check internet connection and disk space
df -h  # Check available space
```

### Frontend Issues

**Problem**: `Cannot find module` errors
```bash
# Solution: Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Problem**: `ECONNREFUSED` when calling API
```bash
# Solution: Ensure backend is running
curl http://localhost:8000
```

**Problem**: Blank page in browser
```bash
# Solution: Check browser console for errors
# Press F12 and check Console tab
```

### General Issues

**Problem**: Slow generation times
- **Cause**: CPU-only inference is slower
- **Solution**: 
  - Use shorter chapters
  - Reduce chunk retrieval (edit `backend/services/rag_service.py`)
  - Consider upgrading RAM

**Problem**: High memory usage
- **Solution**: 
  - Close other applications
  - Process smaller textbooks
  - Restart the backend

---

## 🧪 Testing

### Test Backend API

```bash
# Check status
curl http://localhost:8000/status

# Upload test file (with a real PDF)
curl -X POST http://localhost:8000/upload \
  -F "file=@/path/to/test.pdf"

# Generate summary
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"chapter": "1", "option": "summary"}'
```

### Test Frontend

1. Open browser DevTools (F12)
2. Go to Network tab
3. Upload a file
4. Check API calls are successful (status 200)

---

## 📊 Performance Expectations

| Operation | Time | Notes |
|-----------|------|-------|
| Initial setup | 10-15 min | One-time model download |
| Upload 100-page PDF | 2-3 min | Text extraction + embeddings |
| Upload 300-page PDF | 4-5 min | Longer text processing |
| Generate summary | 30-45 sec | LLM generation time |
| Generate all outputs | 60-90 sec | Multiple LLM calls |
| Ask question | 20-30 sec | Single LLM inference |

**System Requirements**:
- **Minimum**: 8GB RAM, 5GB disk space
- **Recommended**: 16GB RAM, 10GB disk space

---

## 🎓 Usage Tips

1. **Better Results**:
   - Upload textbooks with clear chapter structure
   - Use specific chapter numbers/names
   - Ask focused questions

2. **Performance**:
   - Close other applications during processing
   - Process one textbook at a time
   - Restart backend if memory usage is high

3. **Accuracy**:
   - Verify generated content
   - Use Q&A to test understanding
   - Cross-reference with original textbook

---

## 🔄 Updates & Maintenance

### Update Dependencies

**Backend**:
```bash
cd backend
source venv/bin/activate
pip install --upgrade -r requirements.txt
```

**Frontend**:
```bash
cd frontend
npm update
```

### Clear Cache

**Backend** (clears uploaded files and vector store):
```bash
rm -rf backend/storage/*
```

**Frontend** (clears build cache):
```bash
cd frontend
rm -rf node_modules/.vite
npm run dev
```

---

## 🆘 Getting Help

1. Check this setup guide thoroughly
2. Review the main README.md
3. Check backend logs for error messages
4. Check browser console (F12) for frontend errors
5. Open a GitHub issue with:
   - Error message
   - Steps to reproduce
   - System info (OS, Python version, Node version)

---

## ✅ Next Steps

Once setup is complete:

1. ✅ Upload a sample textbook (50-100 pages recommended for first try)
2. ✅ Generate a summary to test the system
3. ✅ Try asking questions
4. ✅ Explore all features
5. ✅ Read the main README for advanced usage

**Enjoy learning with EduSummary! 📚✨**
