import { useEffect, useState } from 'react';
import API from '../../api/axios';

export default function UserOverviewPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    API.get('/api/admin/users').then(r => setUsers(r.data));
  }, []);

  return (
    <div>
      <h3>👥 User Overview</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <span style={{
                  background: u.role === 'ADMIN' ? '#7c83fd' : '#4caf50',
                  color: 'white', padding: '2px 10px',
                  borderRadius: 20, fontSize: '0.8rem'
                }}>
                  {u.role}
                </span>
              </td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}