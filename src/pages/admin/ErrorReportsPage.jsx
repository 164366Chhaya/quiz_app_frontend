import { useEffect, useState } from 'react';
import API from '../../api/axios';

export default function ErrorReportsPage() {
  const [reports, setReports] = useState([]);
  const [editing, setEditing] = useState(null); // holds the report being edited
  const [form, setForm] = useState({});

  const load = () => API.get('/api/admin/error-reports').then(r => setReports(r.data));
  useEffect(() => { load(); }, []);

  const openEdit = (report) => {
    const q = report.question;
    setEditing(report.id);
    setForm({
      question_text: q.questionText,
      option_a: q.optionA,
      option_b: q.optionB,
      option_c: q.optionC,
      option_d: q.optionD,
      correct_option: q.correctOption,
      solution_text: q.solutionText,
      hint_text: q.hintText,
    });
  };

  const saveAndFix = async (report) => {
    try {
      // Update the question
      await API.put(`/api/admin/questions/${report.question.qid}`, form);
      // Mark report as fixed
      await API.put(`/api/admin/error-reports/${report.id}/fix`);
      setEditing(null);
      load();
      alert('Question updated and report marked as fixed! ✅');
    } catch (e) {
      alert('Failed: ' + e.message);
    }
  };

  const field = (label, key, multiline = false) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontWeight: 600, display: 'block', marginBottom: 4, color: '#1a1a2e' }}>
        {label}
      </label>
      {multiline
        ? <textarea rows={3} style={inputStyle}
            value={form[key] || ''}
            onChange={e => setForm({ ...form, [key]: e.target.value })} />
        : <input style={inputStyle}
            value={form[key] || ''}
            onChange={e => setForm({ ...form, [key]: e.target.value })} />
      }
    </div>
  );

  return (
    <div>
      <h3>🚩 Open Error Reports</h3>
      {reports.length === 0 && (
        <p style={{ color: '#888', marginTop: 16 }}>No open reports. Everything looks good! 🎉</p>
      )}

      {reports.map(r => (
        <div key={r.id} className="review-card" style={{ marginBottom: 20 }}>

          {/* Report Summary */}
          <div style={{ marginBottom: 12 }}>
            <p><strong>QID:</strong> {r.question?.qid}</p>
            <p><strong>Question:</strong> {r.question?.questionText}</p>
            <p style={{ color: '#c0392b' }}>
              <strong>🚩 User Comment:</strong> {r.comment || 'No comment provided'}
            </p>
            <p><strong>Reported by:</strong> {r.reportedBy?.email}</p>
            <p style={{ color: '#888', fontSize: '0.85rem' }}>
              {new Date(r.reportedAt).toLocaleString()}
            </p>
          </div>

          {/* Edit Form */}
          {editing === r.id ? (
            <div style={{ background: '#f8f8ff', padding: 20, borderRadius: 10, border: '1px solid #dde1ff' }}>
              <h4 style={{ marginBottom: 16, color: '#5a63e8' }}>✏️ Edit Question</h4>

              {field('Question Text', 'question_text', true)}
              {field('Option A', 'option_a')}
              {field('Option B', 'option_b')}
              {field('Option C', 'option_c')}
              {field('Option D', 'option_d')}

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Correct Option
                </label>
                <select style={inputStyle}
                  value={form.correct_option || ''}
                  onChange={e => setForm({ ...form, correct_option: e.target.value })}>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>

              {field('Solution Text', 'solution_text', true)}
              {field('Hint Text', 'hint_text')}

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button className="primary-btn" onClick={() => saveAndFix(r)}>
                  ✅ Save & Mark as Fixed
                </button>
                <button onClick={() => setEditing(null)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="primary-btn" onClick={() => openEdit(r)}>
              ✏️ Fix This Question
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #dde1ff',
  fontSize: '0.95rem',
  fontFamily: 'inherit',
  background: 'white',
};