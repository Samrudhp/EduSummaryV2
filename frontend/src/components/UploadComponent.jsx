import { useState } from 'react';
import './UploadComponent.css';

function UploadComponent({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    const validTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 
                        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                        'application/msword', 
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (validTypes.includes(selectedFile.type) || 
        selectedFile.name.match(/\.(pdf|ppt|pptx|doc|docx)$/i)) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please upload a PDF, PPT, or DOCX file');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const { uploadTextbook } = await import('../api');
      const response = await uploadTextbook(file);
      onUploadSuccess(response);
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Textbook</h2>
      <div 
        className={`drop-zone ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          accept=".pdf,.ppt,.pptx,.doc,.docx"
          onChange={handleChange}
          disabled={uploading}
        />
        <label htmlFor="file-upload" className="upload-label">
          <div className="upload-icon">📁</div>
          <p>Drag & drop your textbook here</p>
          <p className="or-text">or</p>
          <button type="button" className="browse-btn">
            Browse Files
          </button>
          <p className="supported-formats">Supported: PDF, PPT, DOCX</p>
        </label>
      </div>

      {file && (
        <div className="file-info">
          <p><strong>Selected:</strong> {file.name}</p>
          <p><strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <button 
        className="upload-btn"
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading ? (
          <>
            <span className="spinner"></span>
            Processing...
          </>
        ) : (
          'Upload & Process'
        )}
      </button>

      {uploading && (
        <div className="processing-info">
          <p>⏳ Extracting text and creating embeddings...</p>
          <p>This may take 2-5 minutes for large textbooks.</p>
        </div>
      )}
    </div>
  );
}

export default UploadComponent;
