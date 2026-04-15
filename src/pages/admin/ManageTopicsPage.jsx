import { useEffect, useState } from 'react';
import API from '../../api/axios';

const SSC_SUBJECTS = [
  "Quantitative Aptitude",
  "General Intelligence & Reasoning", 
  "English Comprehension",
  "General Awareness",
  "Mathematical Abilities (Tier 2)",
  "English Language & Comprehension (Tier 2)",
  "Computer Knowledge",
];

export default function ManageTopicsPage() {
  const [topics, setTopics] = useState([]);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [bulkSubject, setBulkSubject] = useState('');
  const [bulkCustomSubject, setBulkCustomSubject] = useState('');
  const [showBulkCustom, setShowBulkCustom] = useState(false);
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'bulk' | 'list'

  const load = () => API.get('/api/admin/topics').then(r => setTopics(r.data));
  useEffect(() => { load(); }, []);

  // Existing subjects from DB
  const existingSubjects = [...new Set(topics.map(t => t.subject))];
  const allSubjects = [...new Set([...SSC_SUBJECTS, ...existingSubjects])];

  const handleSubjectChange = (val, setSubjectFn, setShowCustomFn) => {
    if (val === '__new__') {
      setSubjectFn('');
      setShowCustomFn(true);
    } else {
      setSubjectFn(val);
      setShowCustomFn(false);
    }
  };

  // ── Single Topic Add ───────────────────────────────────
  const createTopic = async () => {
    const finalSubject = showCustom ? customSubject : subject;
    if (!name.trim() || !finalSubject.trim()) {
      alert('Fill both topic name and subject'); return;
    }
    await API.post('/api/admin/topics', { name: name.trim(), subject: finalSubject.trim() });
    setName(''); setSubject(''); setCustomSubject(''); setShowCustom(false);
    load();
  };

  // ── Bulk Topic Add ─────────────────────────────────────
  const bulkCreate = async () => {
    const finalSubject = showBulkCustom ? bulkCustomSubject : bulkSubject;
    if (!finalSubject.trim()) { alert('Select or enter a subject'); return; }
    const names = bulkText.split('\n')
      .map(n => n.trim()).filter(n => n.length > 0);
    if (names.length === 0) { alert('Enter at least one topic name'); return; }

    let success = 0, failed = 0;
    for (const n of names) {
      try {
        await API.post('/api/admin/topics', { name: n, subject: finalSubject.trim() });
        success++;
      } catch { failed++; }
    }
    alert(`✅ Added: ${success} | ❌ Failed: ${failed}`);
    setBulkText(''); setBulkSubject(''); setBulkCustomSubject('');
    setShowBulkCustom(false);
    load();
  };

  // ── Edit ───────────────────────────────────────────────
  const startEdit = (t) => {
    setEditingId(t.id);
    setEditName(t.name);
    setEditSubject(t.subject);
  };

  const saveEdit = async (id) => {
    await API.put(`/api/admin/topics/${id}`, { name: editName, subject: editSubject });
    setEditingId(null);
    load();
  };

  const deleteTopic = async (id) => {
    if (!window.confirm('Delete this topic? Questions in it will be orphaned.')) return;
    await API.delete(`/api/admin/topics/${id}`);
    load();
  };

  // Group topics by subject for display
  const grouped = topics.reduce((acc, t) => {
    if (!acc[t.subject]) acc[t.subject] = [];
    acc[t.subject].push(t);
    return acc;
  }, {});

  return (
    <div>
      <h3>📚 Manage Topics</h3>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, marginTop: 12 }}>
        {['single', 'bulk', 'list'].map(tab => (
          <button key={tab}
            className={activeTab === tab ? 'selected-btn' : 'outline-btn'}
            onClick={() => setActiveTab(tab)}>
            {tab === 'single' ? '➕ Add Single' : tab === 'bulk' ? '📋 Bulk Add' : '📂 View All'}
          </button>
        ))}
      </div>

      {/* ── Single Add ── */}
      {activeTab === 'single' && (
        <div className="config-section">
          <h4 style={{ marginBottom: 16 }}>Add a Single Topic</h4>

          <label style={labelStyle}>Topic Name</label>
          <input style={inputStyle} placeholder="e.g. Percentage"
            value={name} onChange={e => setName(e.target.value)} />

          <label style={labelStyle}>Subject</label>
          <select style={inputStyle}
            value={showCustom ? '__new__' : subject}
            onChange={e => handleSubjectChange(e.target.value, setSubject, setShowCustom)}>
            <option value="">— Select Subject —</option>
            {allSubjects.map(s => <option key={s} value={s}>{s}</option>)}
            <option value="__new__">➕ Add New Subject...</option>
          </select>

          {showCustom && (
            <input style={{ ...inputStyle, marginTop: 8 }}
              placeholder="Type new subject name"
              value={customSubject}
              onChange={e => setCustomSubject(e.target.value)} />
          )}

          <button className="primary-btn" style={{ marginTop: 16 }} onClick={createTopic}>
            Add Topic
          </button>
        </div>
      )}

      {/* ── Bulk Add ── */}
      {activeTab === 'bulk' && (
        <div className="config-section">
          <h4 style={{ marginBottom: 4 }}>Bulk Add Topics</h4>
          <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: 16 }}>
            One topic name per line. All will be added under the selected subject.
          </p>

          <label style={labelStyle}>Subject (for all topics below)</label>
          <select style={inputStyle}
            value={showBulkCustom ? '__new__' : bulkSubject}
            onChange={e => handleSubjectChange(e.target.value, setBulkSubject, setShowBulkCustom)}>
            <option value="">— Select Subject —</option>
            {allSubjects.map(s => <option key={s} value={s}>{s}</option>)}
            <option value="__new__">➕ Add New Subject...</option>
          </select>

          {showBulkCustom && (
            <input style={{ ...inputStyle, marginTop: 8 }}
              placeholder="Type new subject name"
              value={bulkCustomSubject}
              onChange={e => setBulkCustomSubject(e.target.value)} />
          )}

          <label style={{ ...labelStyle, marginTop: 12 }}>Topic Names (one per line)</label>
          <textarea rows={12} style={{ ...inputStyle, resize: 'vertical' }}
            placeholder={`Number System & Simplification\nPercentage\nRatio & Proportion\nAverage\nProfit & Loss`}
            value={bulkText}
            onChange={e => setBulkText(e.target.value)} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <span style={{ color: '#888', fontSize: '0.85rem' }}>
              {bulkText.split('\n').filter(n => n.trim()).length} topics ready to add
            </span>
            <button className="primary-btn" onClick={bulkCreate}>
              Add All Topics ✅
            </button>
          </div>
        </div>
      )}

      {/* ── View All ── */}
      {activeTab === 'list' && (
        <div>
          {Object.entries(grouped).map(([subj, topicList]) => (
            <div key={subj} style={{ marginBottom: 24 }}>
              <h4 style={{
                background: '#1a1a2e', color: '#7c83fd',
                padding: '8px 16px', borderRadius: 8, marginBottom: 8
              }}>
                {subj} ({topicList.length})
              </h4>
              <table className="data-table">
                <thead>
                  <tr><th>ID</th><th>Topic Name</th><th>Subject</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {topicList.map(t => (
                    <tr key={t.id}>
                      <td style={{ color: '#888', fontSize: '0.85rem' }}>{t.id}</td>
                      <td>
                        {editingId === t.id
                          ? <input style={{ ...inputStyle, padding: '6px 10px' }}
                              value={editName} onChange={e => setEditName(e.target.value)} />
                          : t.name}
                      </td>
                      <td>
                        {editingId === t.id
                          ? <input style={{ ...inputStyle, padding: '6px 10px' }}
                              value={editSubject} onChange={e => setEditSubject(e.target.value)} />
                          : <span style={{
                              background: '#eceeff', color: '#5a63e8',
                              padding: '2px 10px', borderRadius: 12, fontSize: '0.8rem'
                            }}>{t.subject}</span>}
                      </td>
                      <td>
                        {editingId === t.id
                          ? <>
                              <button className="primary-btn"
                                style={{ padding: '4px 12px', marginRight: 6 }}
                                onClick={() => saveEdit(t.id)}>Save</button>
                              <button onClick={() => setEditingId(null)}>Cancel</button>
                            </>
                          : <>
                              <button style={{ marginRight: 6 }} onClick={() => startEdit(t)}>✏️ Edit</button>
                              <button style={{ color: '#f44336' }} onClick={() => deleteTopic(t.id)}>🗑️</button>
                            </>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* SSC Syllabus Quick Reference */}
      <div className="config-section" style={{ marginTop: 24, background: '#f8f8ff' }}>
        <h4 style={{ marginBottom: 8 }}>📋 SSC CGL Syllabus Quick Reference</h4>
        <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: 12 }}>
          Click any topic to pre-fill the Add Single form
        </p>
        {Object.entries(SSC_SYLLABUS).map(([subj, topicsList]) => (
          <div key={subj} style={{ marginBottom: 12 }}>
            <p style={{ fontWeight: 700, color: '#1a1a2e', marginBottom: 6 }}>{subj}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {topicsList.map(t => {
                const exists = topics.some(
                  existing => existing.name.toLowerCase() === t.toLowerCase()
                );
                return (
                  <span key={t}
                    onClick={() => {
                      if (!exists) {
                        setName(t);
                        setSubject(subj);
                        setShowCustom(false);
                        setActiveTab('single');
                      }
                    }}
                    style={{
                      padding: '4px 10px', borderRadius: 16, fontSize: '0.8rem',
                      cursor: exists ? 'default' : 'pointer',
                      background: exists ? '#e8f5e9' : '#eceeff',
                      color: exists ? '#2e7d32' : '#5a63e8',
                      border: `1px solid ${exists ? '#4caf50' : '#dde1ff'}`,
                      textDecoration: exists ? 'none' : 'underline dotted'
                    }}>
                    {exists ? '✅ ' : ''}{t}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SSC_SYLLABUS = {
  "Quantitative Aptitude": [
    "Number System", "Percentage", "Ratio & Proportion","Simplification",
    "Average", "Profit & Loss", "Discount", "Simple Interest", "Compound Interest",
    "Time & Work", "Pipe & Cistern", "Time, Speed & Distance", "Problems on Train",
    "Boat & Stream", "Mixture & Alligation", "Partnership", "Problems on Ages",
    "Mensuration", "Algebra", "Geometry", "Coordinate Geometry",
    "Trigonometry", "Data Interpretation", "Statistics"
  ],
  "General Intelligence & Reasoning": [
    "Analogy", "Series", "Coding-Decoding", "Blood Relations",
    "Direction & Distance", "Syllogism", "Statement & Conclusion",
    "Order & Ranking", "Calendar & Clock", "Matrix", "Venn Diagram",
    "Missing Number", "Non-Verbal Reasoning"
  ],
  "English Comprehension": [
    "Reading Comprehension", "Fill in the Blanks", "Error Spotting",
    "Sentence Improvement", "Para Jumbles", "Synonyms", "Antonyms",
    "One Word Substitution", "Idioms & Phrases", "Spelling Correction", "Cloze Test"
  ],
  "General Awareness": [
    "Current Affairs", "History", "Geography", "Indian Polity", "Constitution",
    "Economy & Budget Basics", "Science", "Static GK", "Computer Basics"
  ],
  "Mathematical Abilities (Tier 2)": [
    "Advanced Data Interpretation", "Advanced Algebra",
    "Advanced Geometry", "Advanced Trigonometry"
  ],
  "English Language & Comprehension (Tier 2)": [
    "Advanced Grammar", "Advanced Vocabulary", "Passage-based Questions"
  ],
  "Computer Knowledge": [
    "Basic Computer", "MS Office", "Internet & Networking",
    "Cyber Security", "Data Entry Speed Test"
  ],
};

const labelStyle = {
  display: 'block', fontWeight: 600,
  marginBottom: 6, color: '#1a1a2e', fontSize: '0.9rem'
};

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: '1px solid #dde1ff', fontSize: '0.95rem',
  fontFamily: 'inherit', background: 'white', marginBottom: 4,
  boxSizing: 'border-box'
};