import { useState } from 'react';
import './OutputComponent.css';

function OutputComponent({ data }) {
  const [activeTab, setActiveTab] = useState('summary');

  if (!data) {
    return null;
  }

  const tabs = [];
  if (data.summary) tabs.push({ id: 'summary', label: 'Summary', icon: '📝' });
  if (data.concept_map) tabs.push({ id: 'conceptmap', label: 'Concept Map', icon: '🗺️' });
  if (data.tricks) tabs.push({ id: 'tricks', label: 'Tricks & Mnemonics', icon: '💡' });
  if (data.qna && data.qna.length > 0) tabs.push({ id: 'qna', label: 'Q&A', icon: '❓' });

  // Set first available tab as active if current is not available
  if (tabs.length > 0 && !tabs.find(t => t.id === activeTab)) {
    setActiveTab(tabs[0].id);
  }

  return (
    <div className="output-container">
      <h2>Chapter {data.chapter} - Generated Content</h2>

      {tabs.length > 0 && (
        <div className="tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="content-area">
        {activeTab === 'summary' && data.summary && (
          <div className="summary-content">
            <h3>Summary</h3>
            <div className="content-text">
              {data.summary.split('\n').map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'conceptmap' && data.concept_map && (
          <div className="conceptmap-content">
            <h3>Concept Map</h3>
            <div className="content-text concept-tree">
              {data.concept_map.split('\n').map((line, idx) => (
                <p key={idx} style={{ 
                  marginLeft: `${(line.match(/^\s*/)[0].length) * 10}px` 
                }}>
                  {line.trim()}
                </p>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tricks' && data.tricks && (
          <div className="tricks-content">
            <h3>Tricks & Mnemonics</h3>
            <div className="content-text tricks-list">
              {data.tricks.split('\n').filter(line => line.trim()).map((line, idx) => (
                <div key={idx} className="trick-card">
                  <span className="trick-icon">💡</span>
                  <p>{line}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'qna' && data.qna && data.qna.length > 0 && (
          <div className="qna-content">
            <h3>Questions & Answers</h3>
            <div className="qna-list">
              {data.qna.map((item, idx) => (
                <QnACard key={idx} number={idx + 1} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function QnACard({ number, item }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="qna-card">
      <div 
        className="qna-question"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="qna-number">Q{number}</span>
        <span className="question-text">{item.question}</span>
        <span className={`expand-icon ${expanded ? 'expanded' : ''}`}>▼</span>
      </div>
      {expanded && (
        <div className="qna-answer">
          <strong>Answer:</strong>
          <p>{item.answer}</p>
        </div>
      )}
    </div>
  );
}

export default OutputComponent;
