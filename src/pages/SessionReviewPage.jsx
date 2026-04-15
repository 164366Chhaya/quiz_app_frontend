import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function SessionReviewPage() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get(`/api/quiz/session/${id}`).then(res => setResult(res.data));
  }, [id]);

  if (!result) return <div className="center">Loading...</div>;

  return (
    <div className="page">
      <h2>🔍 Session #{id} Review</h2>
      <button onClick={() => navigate('/sessions')}>← Back to Sessions</button>
      <div className="result-summary">
        <div className="stat-card">✅ {result.correct}</div>
        <div className="stat-card">❌ {result.incorrect}</div>
        <div className="stat-card">⏭ {result.skipped}</div>
        <div className="stat-card">📈 {result.accuracy?.toFixed(1)}%</div>
      </div>
      {result.questionReviews?.map((q, i) => (
        <div key={q.qid} className={`review-card ${q.correct ? 'correct' : q.skipped ? 'skipped' : 'wrong'}`}>
          <p><strong>Q{i + 1}.</strong> {q.questionText}</p>
          {['A','B','C','D'].map(opt => (
            <p key={opt} style={{
              color: q.correctOption === opt ? 'green'
                : q.userAnswer === opt ? 'red' : 'inherit',
              fontWeight: q.correctOption === opt ? 'bold' : 'normal'
            }}>
              {opt}. {q[`option${opt}`]}
            </p>
          ))}
          {q.solutionText && <p className="solution">💡 {q.solutionText}</p>}
        </div>
      ))}
      <button onClick={() => navigate('/dashboard')}>← Back</button>
    </div>
  );
}