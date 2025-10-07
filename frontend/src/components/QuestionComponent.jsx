import { useState } from 'react';
import './QuestionComponent.css';

function QuestionComponent() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState('');

  const handleAsk = async () => {
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    setAsking(true);
    setError('');
    setAnswer(null);

    try {
      const { askQuestion } = await import('../api');
      const response = await askQuestion(question);
      setAnswer(response);
    } catch (err) {
      setError(err.message || 'Failed to get answer. Please try again.');
    } finally {
      setAsking(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="question-container">
      <h2>Ask a Question</h2>
      <p className="subtitle">Ask anything about the uploaded textbook</p>

      <div className="question-input-area">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your question here... (Press Enter to send)"
          rows="4"
          disabled={asking}
        />
        
        <button 
          className="ask-btn"
          onClick={handleAsk}
          disabled={asking || !question.trim()}
        >
          {asking ? (
            <>
              <span className="spinner"></span>
              Thinking...
            </>
          ) : (
            <>
              <span className="ask-icon">🤔</span>
              Ask Question
            </>
          )}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {asking && (
        <div className="asking-info">
          <p>🤖 Searching through the textbook...</p>
        </div>
      )}

      {answer && (
        <div className="answer-container">
          <h3>Answer:</h3>
          <div className="answer-content">
            <p>{answer.answer}</p>
          </div>
          
          {answer.sources && answer.sources.length > 0 && (
            <div className="sources">
              <strong>Sources:</strong>
              <div className="source-tags">
                {answer.sources.map((source, idx) => (
                  <span key={idx} className="source-tag">{source}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default QuestionComponent;
