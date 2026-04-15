import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function QuizConfigPage() {
  const [topics, setTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [numQuestions, setNumQuestions] = useState(10);
  const [timer, setTimer] = useState(60);
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [negRatio, setNegRatio] = useState(0.25);
  const [quizMode, setQuizMode] = useState('review');
  const [loading, setLoading] = useState(false);
  const [collapsedSubjects, setCollapsedSubjects] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/api/topics').then(res => setTopics(res.data));
  }, []);

  const toggleTopic = (id) => {
    setSelectedTopics(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const toggleSubject = (subject) => {
    setCollapsedSubjects(prev => ({
      ...prev,
      [subject]: !prev[subject]
    }));
  };

  const selectAllInSubject = (topicList) => {
    const ids = topicList.map(t => t.id);
    const allSelected = ids.every(id => selectedTopics.includes(id));
    if (allSelected) {
      setSelectedTopics(prev => prev.filter(id => !ids.includes(id)));
    } else {
      setSelectedTopics(prev => [...new Set([...prev, ...ids])]);
    }
  };

  const startQuiz = async () => {
    if (selectedTopics.length === 0) {
      alert('Select at least one topic!'); return;
    }
    setLoading(true);
    try {
      const res = await API.post('/api/quiz/start', {
        topicIds: selectedTopics,
        numberOfQuestions: numQuestions,
        timerPerQuestion: timer,
        negativeMarking,
        negativeMarkRatio: negRatio,
      });
      navigate('/quiz/play', { state: { quizData: res.data, quizMode } });
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Unknown error';
      alert('Failed to start quiz: ' + msg);
      setLoading(false);
    }
  };

  const grouped = topics.reduce((acc, t) => {
    if (!acc[t.subject]) acc[t.subject] = [];
    acc[t.subject].push(t);
    return acc;
  }, {});

  return (
    <div className="page">
      <h2>⚙️ Configure Your Quiz</h2>

      {/* ── Topics ── */}
      <div className="config-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3>📚 Select Topics</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: '0.85rem', color: '#7c83fd', fontWeight: 600 }}>
              {selectedTopics.length} selected
            </span>
            {selectedTopics.length > 0 && (
              <button onClick={() => setSelectedTopics([])}
                style={{ fontSize: '0.8rem', color: '#f44336', background: 'none',
                  border: 'none', cursor: 'pointer', padding: 0 }}>
                Clear all
              </button>
            )}
          </div>
        </div>

        {Object.entries(grouped).map(([subject, topicList]) => {
          const isCollapsed = collapsedSubjects[subject];
          const selectedInSubject = topicList.filter(t => selectedTopics.includes(t.id)).length;
          const allInSubjectSelected = selectedInSubject === topicList.length;

          return (
            <div key={subject} style={{ marginBottom: 12 }}>
              {/* Subject Header — clickable to collapse */}
              <div onClick={() => toggleSubject(subject)}
                style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center',
                  background: selectedInSubject > 0 ? '#1a1a2e' : '#f0f1ff',
                  color: selectedInSubject > 0 ? 'white' : '#1a1a2e',
                  padding: '10px 16px', borderRadius: isCollapsed ? 10 : '10px 10px 0 0',
                  cursor: 'pointer', userSelect: 'none',
                  transition: 'all 0.2s'
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1rem' }}>{isCollapsed ? '▶' : '▼'}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                    {subject.toUpperCase()}
                  </span>
                  {selectedInSubject > 0 && (
                    <span style={{
                      background: '#7c83fd', color: 'white',
                      padding: '2px 8px', borderRadius: 12, fontSize: '0.75rem'
                    }}>
                      {selectedInSubject}/{topicList.length}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span
                    onClick={e => { e.stopPropagation(); selectAllInSubject(topicList); }}
                    style={{
                      fontSize: '0.75rem', fontWeight: 600,
                      color: selectedInSubject > 0 ? '#aac4ff' : '#7c83fd',
                      textDecoration: 'underline', cursor: 'pointer'
                    }}>
                    {allInSubjectSelected ? 'Deselect all' : 'Select all'}
                  </span>
                </div>
              </div>

              {/* Topic Chips — collapsible */}
              {!isCollapsed && (
                <div style={{
                  padding: '12px 16px',
                  background: '#fafbff',
                  border: '1px solid #dde1ff',
                  borderTop: 'none',
                  borderRadius: '0 0 10px 10px',
                }}>
                  <div className="topic-grid">
                    {topicList.map(t => (
                      <div key={t.id}
                        className={`topic-chip ${selectedTopics.includes(t.id) ? 'selected' : ''}`}
                        onClick={() => toggleTopic(t.id)}>
                        {t.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Quiz Mode ── */}
      <div className="config-section">
        <h3>⚡ Quiz Mode</h3>
        <div className="mode-grid">
          <div className={`mode-card ${quizMode === 'rapid' ? 'mode-selected' : ''}`}
            onClick={() => setQuizMode('rapid')}>
            <div className="mode-icon">⚡</div>
            <div className="mode-title">Rapid Quiz</div>
            <div className="mode-desc">Click any option → instantly moves to next question.</div>
          </div>
          <div className={`mode-card ${quizMode === 'review' ? 'mode-selected' : ''}`}
            onClick={() => setQuizMode('review')}>
            <div className="mode-icon">🧠</div>
            <div className="mode-title">Review Quiz</div>
            <div className="mode-desc">Change your mind freely, then click Save & Next.</div>
          </div>
        </div>
      </div>

      {/* ── Number of Questions ── */}
      <div className="config-section">
        <h3>Number of Questions</h3>
        <div className="option-row">
          {[10, 25, 50].map(n => (
            <button key={n}
              className={numQuestions === n ? 'selected-btn' : 'outline-btn'}
              onClick={() => setNumQuestions(n)}>{n}</button>
          ))}
          <input type="number" min="1" max="100"
            value={numQuestions}
            onChange={e => setNumQuestions(Number(e.target.value))}
            style={{ width: 70, padding: '8px', borderRadius: 8, border: '1px solid #dde1ff' }} />
        </div>
      </div>

      {/* ── Timer ── */}
      <div className="config-section">
        <h3>Timer per Question</h3>
        <div className="option-row">
          {[45, 60].map(t => (
            <button key={t}
              className={timer === t ? 'selected-btn' : 'outline-btn'}
              onClick={() => setTimer(t)}>{t}s</button>
          ))}
        </div>
      </div>

      {/* ── Negative Marking ── */}
      <div className="config-section">
        <h3>Negative Marking</h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={negativeMarking}
            onChange={e => setNegativeMarking(e.target.checked)} />
          Enable Negative Marking
        </label>
        {negativeMarking && (
          <div className="option-row" style={{ marginTop: 10 }}>
            {[0.25, 0.5].map(r => (
              <button key={r}
                className={negRatio === r ? 'selected-btn' : 'outline-btn'}
                onClick={() => setNegRatio(r)}>-{r} per wrong</button>
            ))}
          </div>
        )}
      </div>

      {/* ── Start Button ── */}
      <button
        className="primary-btn"
        onClick={startQuiz}
        disabled={loading}
        style={{
          width: '100%', padding: '16px',
          fontSize: '1.1rem', letterSpacing: '0.5px',
          opacity: loading ? 0.8 : 1,
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 10
        }}>
        {loading ? (
          <>
            <span style={{
              width: 20, height: 20, border: '3px solid white',
              borderTop: '3px solid transparent', borderRadius: '50%',
              display: 'inline-block', animation: 'spin 0.8s linear infinite'
            }} />
            Preparing your quiz...
          </>
        ) : (
          `Start Quiz 🚀 (${selectedTopics.length} topic${selectedTopics.length !== 1 ? 's' : ''}, ${numQuestions}Q)`
        )}
      </button>

      {/* Spinner animation */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}