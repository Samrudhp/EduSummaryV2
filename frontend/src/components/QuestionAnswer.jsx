import { useState } from 'react';
import { askQuestion } from '../api';
import './QuestionAnswer.css';

const QuestionAnswer = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    setLoading(true);
    setError('');
    setAnswer(null);

    try {
      const response = await askQuestion(question);
      setAnswer(response);
    } catch (err) {
      setError(err.message || 'Failed to get answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuestion('');
    setAnswer(null);
    setError('');
  };

  return (
    <div className="qa-container">
      <div className="qa-header">
        <h2>Ask a Question</h2>
        <p>Get answers from your uploaded textbook</p>
      </div>

      <form onSubmit={handleSubmit} className="qa-form">
        <div className="input-wrapper">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here... (e.g., What are the main concepts in Chapter 1?)"
            className="question-input"
            rows={4}
          />
          <div className="input-actions">
            {question && (
              <button
                type="button"
                onClick={handleClear}
                className="clear-btn"
                title="Clear"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="ask-btn"
          disabled={loading || !question.trim()}
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              Thinking...
            </>
          ) : (
            <>
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Get Answer
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="error-message">
          <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {answer && (
        <div className="answer-section">
          <div className="answer-header">
            <div className="answer-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3>Answer</h3>
          </div>
          <div className="answer-content">
            <p>{answer.answer}</p>
          </div>
          {answer.sources && answer.sources.length > 0 && (
            <div className="sources">
              <h4>Sources:</h4>
              <div className="source-tags">
                {answer.sources.map((source, index) => (
                  <span key={index} className="source-tag">{source}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionAnswer;
