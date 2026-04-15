import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/api/user/bookmarks').then(res => setBookmarks(res.data));
  }, []);

  const removeBookmark = async (qid) => {
    await API.post(`/api/user/bookmarks/${qid}`);
    setBookmarks(prev => prev.filter(b => b.qid !== qid));
  };

  return (
    <div className="page">
      <h2>🔖 My Bookmarks</h2>
      <br></br><button onClick={() => navigate('/dashboard')}>← Back</button>
      <br></br>
      <br></br>
      {bookmarks.length === 0 && <p>No bookmarks yet.</p>}
      {bookmarks.map(b => (
        <div key={b.qid} className="review-card">
          <p><strong>{b.qid}</strong> — {b.topicName}</p>
          <p>{b.questionText}</p>
          {['A','B','C','D'].map(opt => (
            <p key={opt} style={{ color: b.correctOption === opt ? 'green' : 'inherit', fontWeight: b.correctOption === opt ? 'bold' : 'normal' }}>
              {opt}. {b[`option${opt.toLowerCase()}`] || b[`option${opt}`]}
            </p>
          ))}
          {b.solutionText && <p className="solution">💡 {b.solutionText}</p>}
          <button onClick={() => removeBookmark(b.qid)}>🗑 Remove</button>
        </div>
      ))}
      <button onClick={() => navigate('/dashboard')}>← Back</button>
    </div>
  );
}