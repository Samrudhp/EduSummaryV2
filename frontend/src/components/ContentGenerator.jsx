import { useState } from 'react';
import { generateChapter } from '../api';
import './ContentGenerator.css';

const ContentGenerator = ({ textbookData }) => {
  const [selectedSections, setSelectedSections] = useState([]);
  const [outputTypes, setOutputTypes] = useState({
    summary: true,
    conceptMap: false,
    tricks: false
  });
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [error, setError] = useState('');

  const toggleSection = (sectionId) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedSections.length === textbookData.sections.length) {
      setSelectedSections([]);
    } else {
      setSelectedSections(textbookData.sections.map(s => s.id));
    }
  };

  const handleOutputTypeChange = (type) => {
    setOutputTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleGenerate = async () => {
    if (selectedSections.length === 0) {
      setError('Please select at least one section');
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
      const allResults = {};
      
      const typeMapping = {
        summary: 'summary',
        conceptMap: 'conceptmap',
        tricks: 'tricks'
      };

      const responseMapping = {
        summary: 'summary',
        concept_map: 'conceptMap',
        tricks: 'tricks'
      };
      
      for (const sectionId of selectedSections) {
        const sectionResults = {};
        
        for (const type of selectedTypes) {
          const apiType = typeMapping[type];
          const response = await generateChapter(sectionId, apiType);
          
          const responseKey = Object.keys(responseMapping).find(
            key => responseMapping[key] === type
          );
          
          if (response[responseKey]) {
            sectionResults[type] = response[responseKey];
          }
        }
        
        const section = textbookData.sections.find(s => s.id === sectionId);
        allResults[sectionId] = {
          title: section?.title || sectionId,
          content: sectionResults
        };
      }

      setGeneratedContent(allResults);
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
    <div className="content-generator-layout">
      {/* Sidebar with sections */}
      <div className="sections-sidebar">
        <div className="sidebar-header">
          <h3>Document Sections</h3>
          <p>{textbookData?.sections?.length || 0} parts found</p>
        </div>

        <div className="sidebar-actions">
          <button 
            className="select-all-btn"
            onClick={toggleSelectAll}
          >
            {selectedSections.length === textbookData.sections.length ? 'Deselect All' : 'Select All'}
          </button>
          <span className="selected-count">{selectedSections.length} selected</span>
        </div>

        <div className="sections-list-sidebar">
          {textbookData?.sections?.map((section, index) => (
            <div
              key={section.id}
              className={`section-item ${selectedSections.includes(section.id) ? 'selected' : ''}`}
              onClick={() => toggleSection(section.id)}
            >
              <div className="section-number">{index + 1}</div>
              <div className="section-details">
                <h4>{section.title}</h4>
                <p className="section-preview-mini">{section.preview.substring(0, 80)}...</p>
              </div>
              <div className="section-check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div className="generator-main">
        <div className="generator-header">
          <h2>Generate Learning Content</h2>
          <p>Select sections from sidebar and choose content types</p>
        </div>

        <div className="generator-controls">
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
            disabled={generating || selectedSections.length === 0}
          >
            {generating ? (
              <>
                <div className="spinner"></div>
                Generating for {selectedSections.length} section{selectedSections.length > 1 ? 's' : ''}...
              </>
            ) : (
              <>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Content ({selectedSections.length} section{selectedSections.length !== 1 ? 's' : ''})
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
            {Object.entries(generatedContent).map(([sectionId, sectionData]) => (
              <div key={sectionId} className="section-results">
                <div className="content-header">
                  <h3>{sectionData.title}</h3>
                </div>
                
                {Object.entries(sectionData.content).map(([type, content]) => (
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentGenerator;
