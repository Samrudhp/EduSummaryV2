# 📚 EduSummary API Reference

Complete API documentation for the EduSummary backend.

## Base URL

```
http://localhost:8000
```

## Table of Contents

- [Endpoints](#endpoints)
  - [GET / - Root](#get--root)
  - [POST /upload - Upload Textbook](#post-upload---upload-textbook)
  - [GET /status - System Status](#get-status---system-status)
  - [POST /generate - Generate Content](#post-generate---generate-content)
  - [POST /ask - Ask Question](#post-ask---ask-question)

---

## Endpoints

### GET / - Root

Health check endpoint.

**Request**
```bash
curl http://localhost:8000/
```

**Response**
```json
{
  "message": "EduSummary API is running!",
  "version": "1.0.0"
}
```

**Status Codes**
- `200 OK` - API is running

---

### POST /upload - Upload Textbook

Upload and process a textbook file (PDF, PPT, DOCX).

**Request**
```bash
curl -X POST http://localhost:8000/upload \
  -F "file=@/path/to/textbook.pdf"
```

**Request Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | File | Yes | Textbook file (PDF/PPT/DOCX) |

**Response** (Success)
```json
{
  "status": "success",
  "message": "Textbook processed successfully. System ready.",
  "textbook_name": "textbook.pdf",
  "total_chunks": 245
}
```

**Response** (Error)
```json
{
  "detail": "Unsupported file type. Please upload PDF, PPT, or DOCX."
}
```

**Status Codes**
- `200 OK` - Upload successful
- `400 Bad Request` - Invalid file type or corrupted file
- `500 Internal Server Error` - Processing error

**Processing Time**
- 100-page PDF: ~2-3 minutes
- 200-page PDF: ~4-5 minutes
- PPT/DOCX: Varies based on content

**Notes**
- Previous textbook data will be overwritten
- Files are stored in `backend/storage/uploads/`
- FAISS index is created and persisted

---

### GET /status - System Status

Check if system is ready and get textbook information.

**Request**
```bash
curl http://localhost:8000/status
```

**Response** (System Ready)
```json
{
  "ready": true,
  "textbook_name": "textbook.pdf",
  "total_chunks": 245,
  "message": "System ready"
}
```

**Response** (No Textbook)
```json
{
  "ready": false,
  "textbook_name": null,
  "total_chunks": null,
  "message": "No textbook uploaded"
}
```

**Status Codes**
- `200 OK` - Always returns 200

**Use Case**
- Check system readiness before calling other endpoints
- Get information about currently loaded textbook
- Verify upload was successful

---

### POST /generate - Generate Content

Generate chapter summaries, concept maps, tricks, or Q&A.

**Request**
```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "chapter": "1",
    "option": "all"
  }'
```

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| chapter | string | Yes | Chapter number or name |
| option | string | Yes | Output type: `summary`, `conceptmap`, `tricks`, or `all` |

**Valid Options**
- `summary` - Generate chapter summary
- `conceptmap` - Generate concept map
- `tricks` - Generate memory tricks/mnemonics
- `all` - Generate all outputs including Q&A

**Response** (option: "summary")
```json
{
  "chapter": "1",
  "summary": "This chapter introduces the fundamental concepts of...",
  "concept_map": null,
  "tricks": null,
  "qna": null
}
```

**Response** (option: "all")
```json
{
  "chapter": "1",
  "summary": "Comprehensive summary of chapter 1...",
  "concept_map": "Main Concept\n  - Sub-concept 1\n  - Sub-concept 2\n    - Detail A\n    - Detail B",
  "tricks": "Mnemonic for remembering key points:\nR - Remember\nO - Organize\nI - Implement",
  "qna": [
    {
      "question": "What is the main topic of this chapter?",
      "answer": "The main topic is..."
    },
    {
      "question": "What are the key concepts?",
      "answer": "The key concepts include..."
    }
  ]
}
```

**Response** (Error - Not Ready)
```json
{
  "detail": "System not ready. Please upload a textbook first."
}
```

**Status Codes**
- `200 OK` - Generation successful
- `400 Bad Request` - System not ready
- `500 Internal Server Error` - Generation error

**Processing Time**
- Summary: ~30-45 seconds
- Concept Map: ~30-45 seconds
- Tricks: ~30-45 seconds
- All: ~60-90 seconds

**Notes**
- Retrieves relevant chunks using RAG
- Uses GPT4All for generation
- Quality depends on textbook content and structure

---

### POST /ask - Ask Question

Ask a free-form question about the uploaded textbook.

**Request**
```bash
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is photosynthesis?"
  }'
```

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| question | string | Yes | Question to ask |

**Response**
```json
{
  "question": "What is photosynthesis?",
  "answer": "Photosynthesis is the process by which plants convert light energy into chemical energy...",
  "sources": [
    "Chunk 42",
    "Chunk 87",
    "Chunk 123"
  ]
}
```

**Response** (Error - Not Ready)
```json
{
  "detail": "System not ready. Please upload a textbook first."
}
```

**Status Codes**
- `200 OK` - Answer generated successfully
- `400 Bad Request` - System not ready
- `500 Internal Server Error` - Generation error

**Processing Time**
- ~20-30 seconds per question

**Notes**
- Uses semantic search to find relevant chunks
- Returns top 5 relevant chunks
- Sources show which chunks were used
- Best results with specific questions

---

## Error Handling

### Common Error Responses

**400 Bad Request**
```json
{
  "detail": "Error message describing the issue"
}
```

**500 Internal Server Error**
```json
{
  "detail": "Error processing file: [specific error]"
}
```

### Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Unsupported file type" | Wrong file format | Upload PDF, PPT, or DOCX |
| "System not ready" | No textbook uploaded | Upload a textbook first |
| "Could not extract text" | Corrupted or image-only file | Use text-based PDF |
| "Error processing file" | Various backend issues | Check logs, try again |

---

## Rate Limiting

Currently no rate limiting implemented. For production use, consider:
- Rate limiting per IP
- Request throttling
- Queue management for long-running operations

---

## CORS

CORS is configured to allow all origins (`*`) for development.

**Production**: Update `backend/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://yourfrontend.com"],  # Specify your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Interactive API Documentation

FastAPI provides automatic interactive documentation:

**Swagger UI**: `http://localhost:8000/docs`
- Try endpoints directly
- See request/response schemas
- Test API calls

**ReDoc**: `http://localhost:8000/redoc`
- Alternative documentation format
- Clean, readable interface

---

## Example Workflows

### Complete Upload & Generate Flow

```bash
# 1. Check status
curl http://localhost:8000/status

# 2. Upload textbook
curl -X POST http://localhost:8000/upload \
  -F "file=@textbook.pdf"

# 3. Wait for processing to complete (check response)

# 4. Generate summary
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"chapter": "1", "option": "summary"}'

# 5. Ask a question
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the main topics?"}'
```

### Python Client Example

```python
import requests

BASE_URL = "http://localhost:8000"

# Upload textbook
with open("textbook.pdf", "rb") as f:
    response = requests.post(f"{BASE_URL}/upload", files={"file": f})
    print(response.json())

# Generate summary
response = requests.post(
    f"{BASE_URL}/generate",
    json={"chapter": "1", "option": "all"}
)
print(response.json())

# Ask question
response = requests.post(
    f"{BASE_URL}/ask",
    json={"question": "What is the main concept?"}
)
print(response.json())
```

### JavaScript Client Example

```javascript
const BASE_URL = "http://localhost:8000";

// Upload textbook
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });
  
  return await response.json();
};

// Generate content
const generateContent = async (chapter, option) => {
  const response = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chapter, option }),
  });
  
  return await response.json();
};

// Ask question
const askQuestion = async (question) => {
  const response = await fetch(`${BASE_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  
  return await response.json();
};
```

---

## Security Considerations

For production deployment:

1. **File Upload Security**
   - Implement file size limits
   - Validate file types server-side
   - Scan for malware
   - Use temporary storage

2. **Authentication**
   - Add API key authentication
   - Implement user sessions
   - Rate limiting per user

3. **CORS**
   - Restrict to specific origins
   - Remove wildcard (`*`)

4. **Input Validation**
   - Sanitize chapter input
   - Validate question length
   - Prevent injection attacks

5. **Error Messages**
   - Don't expose internal paths
   - Use generic error messages
   - Log detailed errors server-side

---

## Performance Optimization

### Caching

Consider implementing caching for:
- Generated summaries (same chapter)
- Frequent questions
- Vector store queries

### Async Processing

For better performance:
- Use background tasks for uploads
- Queue system for generation
- WebSocket updates for progress

### Database

For multi-user scenarios:
- Store textbooks in database
- Save generated content
- User management
- Query history

---

## Monitoring & Logging

Current logging outputs to console. For production:

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
```

Track:
- Upload success/failure rates
- Generation times
- Error frequencies
- API response times

---

## Version History

### v1.0.0 (Current)
- Initial release
- Basic upload, generate, and ask functionality
- Local LLM support
- FAISS vector store

---

**For more information, see the main README.md or SETUP.md**
