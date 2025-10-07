#!/bin/bash

echo "🚀 Starting EduSummary Backend..."
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Detect Python from pyenv or system
if command -v pyenv &> /dev/null; then
    # Use pyenv python if available
    PYTHON_CMD=$(pyenv which python 2>/dev/null || pyenv which python3 2>/dev/null || echo "python3")
    PYTHON_VERSION=$(pyenv version-name 2>/dev/null || echo "system")
    echo "🐍 Using Python from pyenv: $PYTHON_VERSION"
    echo "📍 Python path: $PYTHON_CMD"
else
    # Fallback to system python3
    PYTHON_CMD="python3"
    echo "🐍 Using system Python: $(python3 --version)"
fi

echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment with $PYTHON_CMD..."
    $PYTHON_CMD -m venv venv
    echo "✅ Virtual environment created!"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Show which Python is being used
echo "📍 Virtual environment Python: $(python --version)"
echo ""

# Check if dependencies are installed
if [ ! -f "venv/installed" ]; then
    echo "📥 Installing dependencies..."
    pip install -r requirements.txt
    touch venv/installed
    echo "✅ Dependencies installed!"
    echo ""
    echo "📦 Pre-downloading models (one-time setup)..."
    echo "This will cache models in ~/.cache/ for future use"
    python setup_models.py
else
    echo "✅ Dependencies already installed"
fi

# Create necessary directories
mkdir -p storage/uploads

echo ""
echo "📌 Model Cache Information:"
echo "   Models are cached in ~/.cache/ and reused on every run"
echo "   - Embeddings: ~/.cache/huggingface/"
echo "   - GPT4All:    ~/.cache/gpt4all/"
echo "   No re-download needed after first setup!"
mkdir -p models

echo ""
echo "🎯 Starting FastAPI server..."
echo "📍 Backend will be available at: http://localhost:8000"
echo "📖 API docs available at: http://localhost:8000/docs"
echo ""

# Run the server
python main.py
