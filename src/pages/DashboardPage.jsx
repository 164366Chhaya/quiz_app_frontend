import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get('/api/user/dashboard').then(r => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div className="page">
      <div className="navbar">
        <h2>🎯 Let's Quiz It</h2>
        <div className="nav-links">
          <span onClick={() => navigate('/sessions')}>My Sessions</span>
          <span onClick={() => navigate('/bookmarks')}>Bookmarks</span>
          {user?.role === 'ADMIN' && (
            <span onClick={() => navigate('/admin/topics')}>Admin</span>
          )}
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="dashboard-content">
        <h1>Welcome, {user?.name}! 👋</h1>

        {/* Accuracy Cards */}
        {stats && (
          <>
            <div className="result-summary" style={{ justifyContent: 'center', marginBottom: 24 }}>
              <div className="stat-card">
                📅 Today: <strong>{stats.todayAccuracy.toFixed(1)}%</strong>
              </div>
              <div className="stat-card">
                📈 All Time: <strong>{stats.overallAccuracy.toFixed(1)}%</strong>
              </div>
              <div className="stat-card">
                🔥 Streak: <strong>{stats.streak} day{stats.streak !== 1 ? 's' : ''}</strong>
              </div>
              <div className="stat-card">
                📝 Sessions: <strong>{stats.totalSessions}</strong>
              </div>
            </div>

            {/* Topic Progress */}
            {stats.topicStats?.length > 0 && (
              <div style={{ textAlign: 'left', marginBottom: 32 }}>
                <h3 style={{ marginBottom: 12 }}>📊 Topic Progress</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Topic</th>
                      <th>Subject</th>
                      <th>Progress</th>
                      <th>Cycle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topicStats.map((t, i) => {
                      const pct = t.totalQuestions === 0 ? 0
                        : Math.round((t.currentPointer / t.totalQuestions) * 100);
                      return (
                        <tr key={i}>
                          <td>{t.topicName}</td>
                          <td>{t.subject}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{
                                height: 8, width: 120, background: '#eee',
                                borderRadius: 4, overflow: 'hidden'
                              }}>
                                <div style={{
                                  height: '100%', width: `${pct}%`,
                                  background: pct < 50 ? '#f44336' : '#4caf50',
                                  borderRadius: 4
                                }} />
                              </div>
                              <span style={{ fontSize: '0.85rem' }}>
                                {t.currentPointer}/{t.totalQuestions}
                              </span>
                            </div>
                          </td>
                          <td>Cycle {t.cycleCount + 1}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        <button className="primary-btn" onClick={() => navigate('/quiz/config')}>
          Start Quiz 🚀
        </button>
      </div>
    </div>
  );
}