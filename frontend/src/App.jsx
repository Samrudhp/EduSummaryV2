import { useState, useEffect } from 'react';
import UploadComponent from './components/UploadComponent';
import OptionsComponent from './components/OptionsComponent';
import OutputComponent from './components/OutputComponent';
import QuestionComponent from './components/QuestionComponent';
import './App.css';

function App() {
  const [systemReady, setSystemReady] = useState(false);
  const [textbookInfo, setTextbookInfo] = useState(null);
  const [generatedOutput, setGeneratedOutput] = useState(null);

  useEffect(() => {
    // Check status on load
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const { getStatus } = await import('./api');
      const status = await getStatus();
      if (status.ready) {
        setSystemReady(true);
        setTextbookInfo({
          name: status.textbook_name,
          chunks: status.total_chunks
        });
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const handleUploadSuccess = (response) => {
    setSystemReady(true);
    setTextbookInfo({
      name: response.textbook_name,
      chunks: response.total_chunks
    });
  };

  const handleGenerate = (output) => {
    setGeneratedOutput(output);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📚 EduSummary</h1>
        <p className="tagline">AI-Powered Textbook Summarization & Learning Assistant</p>
        {textbookInfo && (
          <div className="textbook-info">
            <span className="info-badge">
              📖 {textbookInfo.name}
            </span>
            <span className="info-badge">
              📊 {textbookInfo.chunks} chunks
            </span>
          </div>
        )}
      </header>

      <main className="app-main">
        {!systemReady ? (
          <div className="welcome-section">
            <div className="welcome-message">
              <h2>Welcome to EduSummary! 👋</h2>
              <p>Upload your textbook to get started with AI-powered summaries, concept maps, and more.</p>
              <div className="features">
                <div className="feature">
                  <span className="feature-icon">✨</span>
                  <span>Chapter Summaries</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🗺️</span>
                  <span>Concept Maps</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">💡</span>
                  <span>Memory Tricks</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">❓</span>
                  <span>Q&A Generation</span>
                </div>
              </div>
            </div>
            <UploadComponent onUploadSuccess={handleUploadSuccess} />
          </div>
        ) : (
          <div className="main-section">
            <div className="actions-section">
              <OptionsComponent onGenerate={handleGenerate} />
              <div className="divider">
                <span>OR</span>
              </div>
              <QuestionComponent />
            </div>

            {generatedOutput && (
              <OutputComponent data={generatedOutput} />
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by LangChain, FAISS, and GPT4All | Running 100% locally</p>
      </footer>
    </div>
  );
}

export default App;
