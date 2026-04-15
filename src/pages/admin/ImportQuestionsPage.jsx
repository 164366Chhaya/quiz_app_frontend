import { useState } from 'react';
import API from '../../api/axios';

export default function ImportQuestionsPage() {
  const [json, setJson] = useState('');
  const [result, setResult] = useState(null);

  const importQuestions = async () => {
    try {
      const parsed = JSON.parse(json);
      const res = await API.post('/api/admin/questions/bulk-import', parsed);
      setResult(res.data);
    } catch (e) {
      alert('Invalid JSON or server error: ' + e.message);
    }
  };

  return (
    <div>
      <h3>Import Questions (Paste JSON Array)</h3>
      <textarea rows={15} style={{ width: '100%' }}
        placeholder='[{ "qid": "PCT-0001", "topic": "Percentage", ... }]'
        value={json} onChange={e => setJson(e.target.value)} />
      <button className="primary-btn" onClick={importQuestions}>
        Import Questions
      </button>
      {result && (
        <div className="result-summary" style={{ marginTop: 15 }}>
          <div className="stat-card">✅ Success: {result.successCount}</div>
          <div className="stat-card">❌ Failed: {result.failureCount}</div>
          {result.errors.length > 0 && (
            <ul>{result.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          )}
        </div>
      )}
    </div>
  );
}