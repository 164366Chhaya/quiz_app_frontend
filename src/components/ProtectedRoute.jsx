import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="center">Loading...</div>;
  if (!user) return <Navigate to="/" />;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/dashboard" />;

  return children;
}