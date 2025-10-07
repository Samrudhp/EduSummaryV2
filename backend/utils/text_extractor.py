"""
Text extraction utilities for PDF, PPT, and DOCX files
"""
import re
from typing import List, Dict
import PyPDF2
import pdfplumber
from pptx import Presentation
from docx import Document


def clean_text(text: str) -> str:
    """Clean and normalize extracted text"""
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove special characters but keep punctuation
    text = re.sub(r'[^\w\s.,;:!?\-\(\)\[\]\'\"]+', '', text)
    # Normalize line breaks
    text = text.replace('\n', ' ').replace('\r', ' ')
    return text.strip()


def extract_from_pdf(file_path: str) -> str:
    """Extract text from PDF using pdfplumber"""
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
    except Exception as e:
        print(f"Error extracting PDF with pdfplumber: {e}")
        # Fallback to PyPDF2
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n\n"
        except Exception as e2:
            print(f"Error extracting PDF with PyPDF2: {e2}")
            raise
    
    return clean_text(text)


def extract_from_pptx(file_path: str) -> str:
    """Extract text from PowerPoint"""
    text = ""
    try:
        prs = Presentation(file_path)
        for slide_num, slide in enumerate(prs.slides, 1):
            for shape in slide.shapes:
                if hasattr(shape, "text"):
                    text += f"\n{shape.text}"
            text += "\n\n"
    except Exception as e:
        print(f"Error extracting PPTX: {e}")
        raise
    
    return clean_text(text)


def extract_from_docx(file_path: str) -> str:
    """Extract text from Word document"""
    text = ""
    try:
        doc = Document(file_path)
        for para in doc.paragraphs:
            if para.text.strip():
                text += para.text + "\n"
        text += "\n"
    except Exception as e:
        print(f"Error extracting DOCX: {e}")
        raise
    
    return clean_text(text)


def extract_text(file_path: str, file_type: str) -> str:
    """Main extraction function"""
    if file_type == "pdf":
        return extract_from_pdf(file_path)
    elif file_type == "pptx":
        return extract_from_pptx(file_path)
    elif file_type == "docx":
        return extract_from_docx(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[Dict[str, any]]:
    """
    Chunk text into smaller pieces with metadata
    chunk_size: approximate number of tokens per chunk
    overlap: number of tokens to overlap between chunks
    """
    # Approximate: 1 token ≈ 4 characters
    char_chunk_size = chunk_size * 4
    char_overlap = overlap * 4
    
    chunks = []
    words = text.split()
    
    current_chunk = []
    current_length = 0
    chunk_id = 0
    
    for word in words:
        current_chunk.append(word)
        current_length += len(word) + 1  # +1 for space
        
        if current_length >= char_chunk_size:
            chunk_text = ' '.join(current_chunk)
            chunks.append({
                'chunk_id': chunk_id,
                'text': chunk_text,
                'metadata': {
                    'chunk_id': chunk_id,
                    'char_count': len(chunk_text)
                }
            })
            chunk_id += 1
            
            # Keep overlap for next chunk
            overlap_words = int(len(current_chunk) * (char_overlap / char_chunk_size))
            current_chunk = current_chunk[-overlap_words:] if overlap_words > 0 else []
            current_length = sum(len(w) + 1 for w in current_chunk)
    
    # Add remaining chunk
    if current_chunk:
        chunk_text = ' '.join(current_chunk)
        chunks.append({
            'chunk_id': chunk_id,
            'text': chunk_text,
            'metadata': {
                'chunk_id': chunk_id,
                'char_count': len(chunk_text)
            }
        })
    
    return chunks
