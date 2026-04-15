import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/api/user/sessions').then(res => setSessions(res.data));
  }, []);

  return (
    <div className="page">
      <h2>📁 My Sessions</h2>
      <br/>
      <button onClick={() => navigate('/dashboard')}>← Back</button>
      
      <br/>
      <br/>
      {sessions.length === 0 && <p>No sessions yet. Take a quiz!</p>}
      {sessions.map(s => (
        <div key={s.sessionId} className="session-card"
          onClick={() => navigate(`/sessions/${s.sessionId}`)}>
          <div><strong>Session #{s.sessionId}</strong></div>
          <div>Score: {s.score?.toFixed(2)} | Accuracy: {s.accuracy?.toFixed(1)}%</div>
          <div>✅ {s.correct} ❌ {s.incorrect} ⏭ {s.skipped}</div>
          <div>{new Date(s.startedAt).toLocaleString()}</div>
        </div>
      ))}
      <button onClick={() => navigate('/dashboard')}>← Back</button>
    </div>
  );
}