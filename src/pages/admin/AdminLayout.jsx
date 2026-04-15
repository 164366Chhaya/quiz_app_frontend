import { Outlet, useNavigate } from 'react-router-dom';

export default function AdminLayout() {
  const navigate = useNavigate();
  return (
    <div className="page">
      <div className="navbar">
        <h2>🛠 Admin Panel</h2>
        <div className="nav-links">
          <span onClick={() => navigate('/admin/topics')}>Topics</span>
          <span onClick={() => navigate('/admin/import')}>Import Questions</span>
          <span onClick={() => navigate('/admin/errors')}>Error Reports</span>
          <span onClick={() => navigate('/admin/users')}>Users</span>
          <span onClick={() => navigate('/dashboard')}>← Dashboard</span>
        </div>
      </div>
      <Outlet />
    </div>
  );
}