import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import TechBackground from './components/layout/TechBackground';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardConductor from './pages/DashboardConductor';
import DashboardPropietario from './pages/DashboardPropietario';
import RegistrarVehiculo from './pages/RegistrarVehiculo';
import UnirseVehiculo from './pages/UnirseVehiculo';
import CalendarioPage from './pages/CalendarioPage';
import DeudasPage from './pages/DeudasPage';
import FeedPage from './pages/FeedPage';

function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return null;
  return user.rol === 'propietario' ? <DashboardPropietario /> : <DashboardConductor />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <TechBackground />
      <div className="app-shell__content">
        <Navbar />
        <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehiculos"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehiculos/nuevo"
          element={
            <ProtectedRoute>
              <RegistrarVehiculo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehiculos/unirse"
          element={
            <ProtectedRoute>
              <UnirseVehiculo />
            </ProtectedRoute>
          }
        />

        <Route
          path="/calendario/:vehiculoId"
          element={
            <ProtectedRoute>
              <CalendarioPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deudas/:vehiculoId"
          element={
            <ProtectedRoute>
              <DeudasPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/comunidad"
          element={
            <ProtectedRoute>
              <FeedPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
