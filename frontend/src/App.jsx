import { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import ContentGenerator from './components/ContentGenerator';
import QuestionAnswer from './components/QuestionAnswer';
import { getStatus } from './api';
import './App.css';

function App() {
  const [textbookData, setTextbookData] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const status = await getStatus();
      if (status.ready) {
        setTextbookData({
          name: status.textbook_name,
          chapters: Array.from({ length: 10 }, (_, i) => i + 1)
        });
        setActiveTab('generate');
      }
    } catch (err) {
      console.log('No textbook loaded yet');
    }
  };

  const handleUploadSuccess = (data) => {
    setTextbookData({
      name: data.filename,
      chapters: Array.from({ length: 10 }, (_, i) => i + 1)
    });
    setActiveTab('generate');
  };

  return (
    <div className="app">
      <div className="background-gradient">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
      </div>

      <nav className="floating-nav">
        <div className="nav-content">
          <div className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="logo-text">EduSummary</span>
          </div>

          {textbookData && (
            <div className="nav-tabs">
              <button className={activeTab === 'upload' ? 'nav-tab active' : 'nav-tab'} onClick={() => setActiveTab('upload')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                Upload
              </button>
              <button className={activeTab === 'generate' ? 'nav-tab active' : 'nav-tab'} onClick={() => setActiveTab('generate')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Generate
              </button>
              <button className={activeTab === 'question' ? 'nav-tab active' : 'nav-tab'} onClick={() => setActiveTab('question')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Q&A
              </button>
            </div>
          )}

          {textbookData && (
            <div className="textbook-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <span>{textbookData.name}</span>
            </div>
          )}
        </div>
      </nav>

      <main className="main-content">
        <div className="content-wrapper">
          {!textbookData || activeTab === 'upload' ? (
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          ) : activeTab === 'generate' ? (
            <ContentGenerator textbookData={textbookData} />
          ) : (
            <QuestionAnswer />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>Powered by AI • Local Processing • Privacy First</p>
      </footer>
    </div>
  );
}

export default App;
