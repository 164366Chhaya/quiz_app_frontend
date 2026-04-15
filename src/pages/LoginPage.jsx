import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function LoginPage() {
  const { user, loading } = useAuth();

  if (loading) return <div className="center">Loading...</div>;
  if (user) return <Navigate to="/dashboard" />;

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🎯 Let's Quiz It</h1>
        <p>SSC CGL Preparation Quiz App</p>
        <a href={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}/oauth2/authorization/google`}>
          <button className="google-btn">
            🔐 Login with Google
          </button>
        </a>
      </div>
    </div>
  );
}