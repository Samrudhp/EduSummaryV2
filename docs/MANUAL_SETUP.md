# Manual Setup Guide - EduSummary Backend

## Python Virtual Environment Setup with pyenv

### Step 1: Find your pyenv Python path

```bash
pyenv which python
```

**Expected output:**
```
/Users/samrudhp/.pyenv/versions/3.10.11/bin/python
```

### Step 2: Create virtual environment using pyenv Python

```bash
cd /Users/samrudhp/Projects-git/EduSummaryV2/backend

# Create venv using pyenv Python 3.10.11
/Users/samrudhp/.pyenv/versions/3.10.11/bin/python -m venv venv
```

### Step 3: Verify the venv was created

```bash
ls -la venv/
```

Should show: `bin/`, `include/`, `lib/`, `pyvenv.cfg`

### Step 4: Check Python version in venv

```bash
./venv/bin/python --version
```

Should show: `Python 3.10.11`

### Step 5: Activate the virtual environment

```bash
source venv/bin/activate
```

Your prompt should now show `(venv)` prefix.

### Step 6: Upgrade pip (recommended)

```bash
pip install --upgrade pip
```

### Step 7: Install dependencies

```bash
pip install -r requirements.txt
```

This will install all required packages:
- fastapi
- uvicorn
- langchain
- sentence-transformers
- gpt4all
- faiss-cpu
- PyPDF2, pdfplumber, python-pptx, python-docx
- etc.

### Step 8: Pre-download models (optional but recommended)

```bash
python setup_models.py
```

This will:
- Download embeddings model to `~/.cache/huggingface/` (~300MB)
- Download GPT4All model to `~/.cache/gpt4all/` (~2GB)

### Step 9: Create necessary directories

```bash
mkdir -p storage/uploads
mkdir -p models
```

### Step 10: Run the backend server

```bash
python main.py
```

Or with uvicorn:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## Quick Reference

### Activate venv (every time)
```bash
cd /Users/samrudhp/Projects-git/EduSummaryV2/backend
source venv/bin/activate
```

### Deactivate venv
```bash
deactivate
```

### Run server
```bash
cd /Users/samrudhp/Projects-git/EduSummaryV2/backend
source venv/bin/activate
python main.py
```

### Check Python in venv
```bash
which python
# Should show: /Users/samrudhp/Projects-git/EduSummaryV2/backend/venv/bin/python
```

---

## Why use pyenv Python?

✅ **Consistent Python version** - Always use 3.10.11
✅ **Isolated from system** - No interference with macOS Python
✅ **Version control** - Easy to switch Python versions
✅ **Project-specific** - Each project can use different versions

---

## Troubleshooting

### If venv creation fails:

```bash
# Make sure pyenv Python is accessible
pyenv which python

# Try creating venv again
cd /Users/samrudhp/Projects-git/EduSummaryV2/backend
rm -rf venv
/Users/samrudhp/.pyenv/versions/3.10.11/bin/python -m venv venv
```

### If pip install fails:

```bash
# Activate venv first
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Try installing again
pip install -r requirements.txt
```

### If models don't download:

```bash
# Check internet connection
ping google.com

# Check cache directories
ls ~/.cache/huggingface/
ls ~/.cache/gpt4all/

# Run setup script
python setup_models.py
```

---

## Summary

✅ **venv created**: Using pyenv Python 3.10.11
✅ **Location**: `/Users/samrudhp/Projects-git/EduSummaryV2/backend/venv`
✅ **Python path**: `/Users/samrudhp/.pyenv/versions/3.10.11/bin/python`

**Next steps:**
1. Activate venv: `source venv/bin/activate`
2. Install dependencies: `pip install -r requirements.txt`
3. Run server: `python main.py`
