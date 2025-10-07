import { useState } from 'react';
import { generateChapter } from '../api';
import './ContentGenerator.css';

const ContentGenerator = ({ textbookData }) => {
  const [selectedChapter, setSelectedChapter] = useState('');
  const [outputTypes, setOutputTypes] = useState({
    summary: true,
    conceptMap: false,
    tricks: false
  });
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [error, setError] = useState('');

  const handleOutputTypeChange = (type) => {
    setOutputTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleGenerate = async () => {
    if (!selectedChapter) {
      setError('Please select a chapter');
      return;
    }

    const selectedTypes = Object.keys(outputTypes).filter(key => outputTypes[key]);
    if (selectedTypes.length === 0) {
      setError('Please select at least one output type');
      return;
    }

    setGenerating(true);
    setError('');
    setGeneratedContent(null);

    try {
      const results = {};
      
      // Map frontend types to backend API format
      const typeMapping = {
        summary: 'summary',
        conceptMap: 'conceptmap',
        tricks: 'tricks'
      };

      // Map backend response keys to frontend keys
      const responseMapping = {
        summary: 'summary',
        concept_map: 'conceptMap',
        tricks: 'tricks'
      };
      
      for (const type of selectedTypes) {
        const apiType = typeMapping[type];
        const response = await generateChapter(selectedChapter, apiType);
        
        console.log('API Response for', type, ':', response);
        
        // Map the response key back to frontend format
        const responseKey = Object.keys(responseMapping).find(
          key => responseMapping[key] === type
        );
        
        if (response[responseKey]) {
          results[type] = response[responseKey];
          console.log('Mapped content for', type, ':', response[responseKey]);
        } else {
          console.warn('No content found for key:', responseKey, 'in response:', response);
        }
      }

      setGeneratedContent(results);
    } catch (err) {
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const outputTypeLabels = {
    summary: 'Summary',
    conceptMap: 'Concept Map',
    tricks: 'Memory Tricks'
  };

  return (
    <div className="content-generator-container">
      <div className="generator-header">
        <h2>Generate Learning Content</h2>
        <p>Select chapter and content types to generate</p>
      </div>

      <div className="generator-controls">
        <div className="form-group">
          <label htmlFor="chapter-select">Select Chapter</label>
          <div className="select-wrapper">
            <select
              id="chapter-select"
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              className="chapter-select"
            >
              <option value="">Choose a chapter...</option>
              {textbookData?.chapters?.map((chapter) => (
                <option key={chapter} value={chapter}>
                  Chapter {chapter}
                </option>
              ))}
            </select>
            <div className="select-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Content Types</label>
          <div className="output-types-grid">
            {Object.keys(outputTypes).map((type) => (
              <label key={type} className={`output-type-card ${outputTypes[type] ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={outputTypes[type]}
                  onChange={() => handleOutputTypeChange(type)}
                />
                <div className="card-content">
                  <div className="card-icon">
                    {type === 'summary' && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    {type === 'conceptMap' && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    )}
                    {type === 'tricks' && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    )}
                  </div>
                  <span className="card-label">{outputTypeLabels[type]}</span>
                  <div className="checkmark">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          className="generate-btn"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <>
              <div className="spinner"></div>
              Generating...
            </>
          ) : (
            <>
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Content
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {generatedContent && (
        <div className="generated-content">
          <div className="content-header">
            <h3>Generated Content for Chapter {selectedChapter}</h3>
          </div>
          
          {Object.entries(generatedContent).map(([type, content]) => (
            <div key={type} className="content-section">
              <div className="section-header">
                <h4>{outputTypeLabels[type]}</h4>
                <button
                  className="copy-btn"
                  onClick={() => copyToClipboard(content)}
                  title="Copy to clipboard"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <div className="content-body">
                <p>{content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentGenerator;
