import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function QuizPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { quizData, quizMode = 'review' } = state || {};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [pendingAnswer, setPendingAnswer] = useState(null); // for review mode
  const [timeLeft, setTimeLeft] = useState(quizData?.timerPerQuestion || 60);
  const [showHint, setShowHint] = useState(false);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [reportComment, setReportComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const questions = quizData?.questions || [];
  const current = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const isRapid = quizMode === 'rapid';

  // ─── Navigation ───────────────────────────────────────────
  const goNext = useCallback(() => {
    setShowHint(false);
    setShowReportPopup(false);
    setPendingAnswer(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setTimeLeft(quizData.timerPerQuestion);
    }
  }, [currentIndex, questions.length, quizData]);

  // ─── Timer ────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft <= 0) {
      // Time up → save whatever answer is pending/selected and move on
      if (pendingAnswer !== null) {
        setAnswers(prev => ({ ...prev, [current.qid]: pendingAnswer }));
      }
      goNext();
      return;
    }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, goNext]);

  // ─── Option Selection ─────────────────────────────────────
  const selectAnswer = (option) => {
    if (isRapid) {
      // Rapid mode: lock answer immediately and go next
      if (answers[current.qid]) return; // already answered
      setAnswers(prev => ({ ...prev, [current.qid]: option }));
      if (!isLast) {
        setTimeout(() => {
          setCurrentIndex(i => i + 1);
          setTimeLeft(quizData.timerPerQuestion);
          setShowHint(false);
        }, 300); // tiny delay so selection is visible
      }
    } else {
      // Review mode: just set pending, allow changing
      setPendingAnswer(option);
    }
  };

  // ─── Save & Next (Review mode only) ───────────────────────
  const saveAndNext = () => {
    if (pendingAnswer !== null) {
      setAnswers(prev => ({ ...prev, [current.qid]: pendingAnswer }));
    }
    if (isLast) {
      submitQuiz({ ...answers, [current.qid]: pendingAnswer });
    } else {
      goNext();
    }
  };

  // ─── Skip ─────────────────────────────────────────────────
  const skipQuestion = () => {
    setAnswers(prev => ({ ...prev, [current.qid]: null }));
    setPendingAnswer(null);
    if (!isLast) goNext();
    else submitQuiz({ ...answers, [current.qid]: null });
  };

  // ─── Submit Quiz ──────────────────────────────────────────
  const submitQuiz = async (finalAnswers = answers) => {
    setSubmitting(true);
    const answerList = questions.map(q => ({
      qid: q.qid,
      userAnswer: finalAnswers[q.qid] ?? null,
      timeTakenSeconds: 0,
    }));
    try {
      const res = await API.post('/api/quiz/submit', {
        sessionId: quizData.sessionId,
        negativeMarkRatio: quizData.negativeMarkRatio,
        answers: answerList,
      });
      navigate('/quiz/results', { state: { result: res.data } });
    } catch (e) {
      alert('Submission failed. Try again.');
      setSubmitting(false);
    }
  };

  // ─── Rapid: Submit on last question ───────────────────────
  useEffect(() => {
    if (isRapid && isLast && answers[current?.qid] !== undefined) {
      submitQuiz();
    }
  }, [answers]);

  // ─── Bookmark & Report ────────────────────────────────────
  const bookmarkQuestion = async () => {
    try {
      await API.post(`/api/user/bookmarks/${encodeURIComponent(current.qid)}`);
      alert('Bookmark toggled! 🔖');
    } catch (e) {
      alert('Bookmark failed: ' + e.message);
    }
  };

  const submitReport = async () => {
    try {
      await API.post('/api/user/error-report', {
        qid: current.qid, comment: reportComment
      });
      setShowReportPopup(false);
      setReportComment('');
      alert('Error reported! 🚩');
    } catch (e) {
      alert('Report failed: ' + e.message);
    }
  };

  if (!quizData) return <div className="center">No quiz data found.</div>;

  // ─── Which answer to highlight ────────────────────────────
  const lockedAnswer = answers[current?.qid];
  const selectedDisplay = isRapid ? lockedAnswer : pendingAnswer;

  return (
    <div className="page">

      {/* Header */}
      <div className="quiz-header">
        <span>Question {currentIndex + 1} / {questions.length}</span>
        <span className={`timer ${timeLeft <= 10 ? 'timer-red' : ''}`}>
          ⏱ {timeLeft}s
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            background: isRapid ? '#ff6b6b' : '#7c83fd',
            color: 'white', padding: '2px 10px',
            borderRadius: 20, fontSize: '0.75rem', fontWeight: 700
          }}>
            {isRapid ? '⚡ Rapid' : '🧠 Review'}
          </span>
          {current?.topicName}
        </span>
      </div>

      {/* Question Card */}
      <div className="question-card">
        <p className="question-text">{current?.questionText}</p>
          {current?.imageUrl && (
            <img src={current.imageUrl} alt="Question diagram"
              style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 16 }} />
          )}
        {/* Options */}
        {['A', 'B', 'C', 'D'].map(opt => {
          const val = current?.[`option${opt}`];
          const isSelected = selectedDisplay === opt;
          const isLocked = isRapid && lockedAnswer;

          return (
            <div key={opt}
              className={`option-card ${isSelected ? 'option-selected' : ''}`}
              style={{
                cursor: isLocked ? 'not-allowed' : 'pointer',
                opacity: isLocked && !isSelected ? 0.5 : 1,
              }}
              onClick={() => !isLocked && selectAnswer(opt)}>
              <strong>{opt}.</strong> {val}
            </div>
          );
        })}

        {/* Mode hint */}
        <p style={{ fontSize: '0.8rem', color: '#999', marginTop: 8 }}>
          {isRapid
            ? '⚡ Rapid mode — selecting an option immediately moves to next question'
            : '🧠 Review mode — change your answer freely, then click Save & Next'}
        </p>

        {/* Action Buttons */}
        <div className="quiz-actions" style={{ marginTop: 16 }}>
          <button onClick={() => setShowHint(h => !h)}>💡 Hint</button>
          <button onClick={bookmarkQuestion}>🔖 Bookmark</button>
          <button onClick={() => setShowReportPopup(true)}>🚩 Report</button>
          <button onClick={skipQuestion}>Skip ⏭</button>

          {/* Review mode only — Save & Next / Submit */}
          {!isRapid && (
            isLast
              ? <button className="primary-btn"
                  onClick={() => submitQuiz()}
                  disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Quiz ✅'}
                </button>
              : <button className="primary-btn"
                  onClick={saveAndNext}>
                  Save & Next ➡
                </button>
          )}

          {/* Rapid mode — only show Submit on last if not auto-submitted */}
          {isRapid && isLast && !submitting && (
            <button className="primary-btn"
              onClick={() => submitQuiz()}
              disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Quiz ✅'}
            </button>
          )}
        </div>

        {/* Hint Box */}
        {showHint && (
          <div className="hint-box">
            💡 {current?.hintText || 'No hint available.'}
          </div>
        )}

        {/* Report Popup */}
        {showReportPopup && (
          <div className="popup">
            <p>Report an error for this question:</p>
            <textarea
              value={reportComment}
              onChange={e => setReportComment(e.target.value)}
              placeholder="Describe the issue (optional)" />
            <div className="option-row">
              <button onClick={submitReport}>Submit</button>
              <button onClick={() => setShowReportPopup(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}