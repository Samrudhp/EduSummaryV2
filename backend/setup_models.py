#!/usr/bin/env python3
"""
Pre-download and cache models for EduSummary
This script downloads models once and caches them for faster startup
"""
import os
import sys

print("=" * 70)
print("EduSummary Model Setup - Pre-downloading and Caching Models")
print("=" * 70)
print()

# 1. Download and cache HuggingFace embeddings model
print("📥 Step 1/2: Downloading Sentence Transformers Embeddings Model")
print("   Model: all-mpnet-base-v2 (~300MB)")
print("   Cache location: ~/.cache/huggingface/")
print()

try:
    from sentence_transformers import SentenceTransformer
    
    model_name = "sentence-transformers/all-mpnet-base-v2"
    cache_folder = os.path.expanduser("~/.cache/huggingface/hub")
    
    # Check if already cached
    if os.path.exists(cache_folder):
        print("   ℹ️  HuggingFace cache directory exists")
    
    print("   ⏳ Loading/downloading model...")
    model = SentenceTransformer(model_name, cache_folder=cache_folder)
    print("   ✅ Embeddings model cached successfully!")
    print()
    
except Exception as e:
    print(f"   ❌ Error: {e}")
    print("   Please install: pip install sentence-transformers")
    sys.exit(1)

# 2. Download and cache GPT4All model
print("📥 Step 2/2: Downloading GPT4All Language Model")
print("   Model: orca-mini-3b-gguf2-q4_0.gguf (~2GB)")
print("   Cache location: ~/.cache/gpt4all/")
print()

try:
    from gpt4all import GPT4All
    
    model_name = "orca-mini-3b-gguf2-q4_0.gguf"
    cache_dir = os.path.expanduser("~/.cache/gpt4all/")
    
    # Check if already cached
    cached_model = os.path.join(cache_dir, model_name)
    if os.path.exists(cached_model):
        print(f"   ℹ️  Model already cached at: {cached_model}")
        print("   ✅ GPT4All model already available!")
    else:
        print("   ⏳ Downloading model (this may take 5-10 minutes)...")
        print("   📊 Download size: ~2GB")
        
        # Initialize GPT4All - it will auto-download to cache
        llm = GPT4All(model_name, allow_download=True)
        print("   ✅ GPT4All model downloaded and cached successfully!")
    
    print()
    
except Exception as e:
    print(f"   ❌ Error: {e}")
    print("   Please install: pip install gpt4all")
    sys.exit(1)

# Summary
print("=" * 70)
print("🎉 Model Setup Complete!")
print("=" * 70)
print()
print("✅ All models are now cached and ready to use")
print()
print("📁 Cache locations:")
print(f"   - Embeddings: ~/.cache/huggingface/")
print(f"   - GPT4All:    ~/.cache/gpt4all/")
print()
print("💡 Future runs will use these cached models (no re-download)")
print()
print("🚀 You can now start the backend server:")
print("   python main.py")
print()
print("=" * 70)
