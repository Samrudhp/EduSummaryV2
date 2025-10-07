import { useState } from 'react';
import './OptionsComponent.css';

function OptionsComponent({ onGenerate }) {
  const [chapter, setChapter] = useState('');
  const [option, setOption] = useState('all');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!chapter.trim()) {
      setError('Please enter a chapter number');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const { generateChapter } = await import('../api');
      const response = await generateChapter(chapter, option);
      onGenerate(response);
    } catch (err) {
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="options-container">
      <h2>Generate Chapter Content</h2>
      
      <div className="input-group">
        <label htmlFor="chapter">Chapter Number:</label>
        <input
          type="text"
          id="chapter"
          value={chapter}
          onChange={(e) => setChapter(e.target.value)}
          placeholder="e.g., 1, 2, Introduction"
          disabled={generating}
        />
      </div>

      <div className="option-group">
        <label>Select Output Type:</label>
        <div className="radio-buttons">
          <label className="radio-label">
            <input
              type="radio"
              value="summary"
              checked={option === 'summary'}
              onChange={(e) => setOption(e.target.value)}
              disabled={generating}
            />
            <span>Summary</span>
          </label>

          <label className="radio-label">
            <input
              type="radio"
              value="conceptmap"
              checked={option === 'conceptmap'}
              onChange={(e) => setOption(e.target.value)}
              disabled={generating}
            />
            <span>Concept Map</span>
          </label>

          <label className="radio-label">
            <input
              type="radio"
              value="tricks"
              checked={option === 'tricks'}
              onChange={(e) => setOption(e.target.value)}
              disabled={generating}
            />
            <span>Tricks & Mnemonics</span>
          </label>

          <label className="radio-label">
            <input
              type="radio"
              value="all"
              checked={option === 'all'}
              onChange={(e) => setOption(e.target.value)}
              disabled={generating}
            />
            <span>All (Summary + Map + Tricks + Q&A)</span>
          </label>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button 
        className="generate-btn"
        onClick={handleGenerate}
        disabled={generating || !chapter.trim()}
      >
        {generating ? (
          <>
            <span className="spinner"></span>
            Generating...
          </>
        ) : (
          'Generate'
        )}
      </button>

      {generating && (
        <div className="generating-info">
          <p>🤖 AI is processing your request...</p>
          <p>This may take 30-60 seconds.</p>
        </div>
      )}
    </div>
  );
}

export default OptionsComponent;
