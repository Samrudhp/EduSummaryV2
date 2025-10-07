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
    """Extract text from PDF using pdfplumber with page preservation"""
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page_num, page in enumerate(pdf.pages, 1):
                page_text = page.extract_text()
                if page_text:
                    # Keep page markers for section detection
                    text += f"[PAGE_{page_num}]\n{page_text}\n\n"
    except Exception as e:
        print(f"Error extracting PDF with pdfplumber: {e}")
        # Fallback to PyPDF2
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num, page in enumerate(pdf_reader.pages, 1):
                    page_text = page.extract_text()
                    if page_text:
                        text += f"[PAGE_{page_num}]\n{page_text}\n\n"
        except Exception as e2:
            print(f"Error extracting PDF with PyPDF2: {e2}")
            raise
    
    return text  # Don't clean yet - we need structure for section detection


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


def extract_sections(text: str) -> List[Dict[str, str]]:
    """
    IMPROVED: Extract sections from text with better detection logic
    Analyzes document structure before creating sections
    """
    print("\n" + "="*60)
    print("ANALYZING DOCUMENT STRUCTURE...")
    print("="*60)
    
    sections = []
    lines = text.split('\n')
    
    # Step 1: Detect heading patterns
    heading_candidates = []
    
    for idx, line in enumerate(lines):
        line = line.strip()
        if not line or line.startswith('[PAGE_'):
            continue
            
        # Pattern 1: Chapter/Section/Unit/Part with numbers
        if re.match(r'^(Chapter|Section|Unit|Part|Module|Lesson)\s+\d+', line, re.IGNORECASE):
            heading_candidates.append({
                'idx': idx,
                'text': line,
                'type': 'numbered_section',
                'confidence': 10
            })
            
        # Pattern 2: Numbered headings (1. 2. 3. or 1.1, 1.2)
        elif re.match(r'^\d+\.(\d+\.?)?\s+[A-Z]', line):
            heading_candidates.append({
                'idx': idx,
                'text': line,
                'type': 'numbered_heading',
                'confidence': 9
            })
            
        # Pattern 3: ALL CAPS SHORT LINES (likely headings)
        elif len(line) >= 3 and len(line) <= 80 and line.isupper() and not line.endswith('.'):
            heading_candidates.append({
                'idx': idx,
                'text': line,
                'type': 'caps_heading',
                'confidence': 7
            })
            
        # Pattern 4: Title Case with no ending punctuation
        elif (len(line) >= 5 and len(line) <= 100 and 
              line[0].isupper() and not line.endswith(('.', ',', ';')) and
              sum(1 for c in line if c.isupper()) >= len(line.split()) * 0.5):
            heading_candidates.append({
                'idx': idx,
                'text': line,
                'type': 'title_case',
                'confidence': 6
            })
    
    print(f"Found {len(heading_candidates)} potential headings")
    
    # Step 2: If we found good headings, use them
    if len(heading_candidates) >= 2:
        # Sort by confidence and position
        heading_candidates.sort(key=lambda x: (x['idx'], -x['confidence']))
        
        # Build sections from headings
        for i, heading in enumerate(heading_candidates):
            start_idx = heading['idx']
            end_idx = heading_candidates[i + 1]['idx'] if i + 1 < len(heading_candidates) else len(lines)
            
            # Extract content between headings
            section_lines = lines[start_idx + 1:end_idx]
            content = ' '.join([l.strip() for l in section_lines if l.strip() and not l.strip().startswith('[PAGE_')])
            
            if len(content) > 50:  # Only include if substantial content
                preview = content[:200] + "..." if len(content) > 200 else content
                sections.append({
                    "id": f"section_{i}",
                    "title": heading['text'][:100],
                    "preview": preview,
                    "content": content,
                    "type": heading['type']
                })
    
    # Step 3: Fallback - divide by pages if no clear headings
    if len(sections) < 2:
        print("No clear headings found - dividing by pages and content...")
        
        # Split by page markers
        page_pattern = r'\[PAGE_(\d+)\]'
        current_page = 1
        current_content = []
        
        for line in lines:
            page_match = re.match(page_pattern, line.strip())
            if page_match:
                # Save previous page content
                if current_content:
                    content_text = ' '.join([l.strip() for l in current_content if l.strip()])
                    if len(content_text) > 100:
                        preview = content_text[:200] + "..." if len(content_text) > 200 else content_text
                        
                        # Try to find a title from first few lines
                        title_lines = [l for l in current_content[:5] if l.strip() and len(l.strip()) > 3]
                        title = title_lines[0][:80] if title_lines else f"Page {current_page}"
                        
                        sections.append({
                            "id": f"section_{current_page - 1}",
                            "title": title,
                            "preview": preview,
                            "content": content_text,
                            "type": "page_based"
                        })
                
                current_page = int(page_match.group(1))
                current_content = []
            else:
                current_content.append(line)
        
        # Add last page
        if current_content:
            content_text = ' '.join([l.strip() for l in current_content if l.strip()])
            if len(content_text) > 100:
                preview = content_text[:200] + "..." if len(content_text) > 200 else content_text
                title_lines = [l for l in current_content[:5] if l.strip() and len(l.strip()) > 3]
                title = title_lines[0][:80] if title_lines else f"Page {current_page}"
                
                sections.append({
                    "id": f"section_{current_page - 1}",
                    "title": title,
                    "preview": preview,
                    "content": content_text,
                    "type": "page_based"
                })
    
    print(f"\n✓ EXTRACTED {len(sections)} SECTIONS:")
    for i, sec in enumerate(sections, 1):
        print(f"  {i}. {sec['title'][:60]} ({len(sec['content'])} chars)")
    print("="*60 + "\n")
    
    return sections


def chunk_text(text: str, chunk_size: int = 300, overlap: int = 30, 
               section_id: str = None, section_title: str = None) -> List[Dict[str, any]]:
    """
    Chunk text into smaller pieces with metadata
    chunk_size: approximate number of tokens per chunk
    overlap: number of tokens to overlap between chunks
    section_id: ID of the section this text belongs to
    section_title: Title of the section
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
                    'char_count': len(chunk_text),
                    'section_id': section_id,
                    'section_title': section_title
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
                'char_count': len(chunk_text),
                'section_id': section_id,
                'section_title': section_title
            }
        })
    
    return chunks
