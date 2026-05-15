import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { loading, user } = useAuth();

  if (loading) return <div className="container" style={{ padding: 24 }}>Cargando…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

