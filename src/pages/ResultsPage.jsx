import { useLocation, useNavigate } from 'react-router-dom';

export default function ResultsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;

  if (!result) return <div className="center">No results found.</div>;

  return (
    <div className="page">
      <h2>📊 Quiz Results</h2>

      <div className="result-summary">
        <div className="stat-card">✅ Correct: {result.correct}</div>
        <div className="stat-card">❌ Wrong: {result.incorrect}</div>
        <div className="stat-card">⏭ Skipped: {result.skipped}</div>
        <div className="stat-card">🎯 Score: {result.score.toFixed(2)}</div>
        <div className="stat-card">📈 Accuracy: {result.accuracy.toFixed(1)}%</div>
        {result.negativeMarking && (
          <div className="stat-card">➖ Deducted: {result.negativeMarksDeducted}</div>
        )}
      </div>

      <div className="recommendation-box">
        💬 {result.recommendation}
      </div>

      {/* Question Reviews */}
      <h3>Question Review</h3>
      {result.questionReviews.map((q, i) => (
        <div key={q.qid} className={`review-card ${q.correct ? 'correct' : q.skipped ? 'skipped' : 'wrong'}`}>
          <p><strong>Q{i + 1}.</strong> {q.questionText}</p>
          {['A', 'B', 'C', 'D'].map(opt => (
            <p key={opt}
              style={{
                color: q.correctOption === opt ? 'green'
                  : q.userAnswer === opt ? 'red' : 'inherit',
                fontWeight: q.correctOption === opt ? 'bold' : 'normal'
              }}>
              {opt}. {q[`option${opt}`]}
              {q.correctOption === opt ? ' ✅' : ''}
              {q.userAnswer === opt && q.userAnswer !== q.correctOption ? ' ❌' : ''}
            </p>
          ))}
          {q.solutionText && <p className="solution">💡 {q.solutionText}</p>}
        </div>
      ))}

      <div className="option-row" style={{ marginTop: 20 }}>
        <button className="primary-btn" onClick={() => navigate('/quiz/config')}>
          New Quiz 🚀
        </button>
        <button onClick={() => navigate('/dashboard')}>Dashboard</button>
      </div>
    </div>
  );
}