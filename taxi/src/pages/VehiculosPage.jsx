import { useAuth } from '../hooks/useAuth';
import DashboardConductor from './DashboardConductor';
import DashboardPropietario from './DashboardPropietario';

export default function VehiculosPage() {
  const { user } = useAuth();
  if (!user) return null;
  return user.rol === 'propietario' ? <DashboardPropietario /> : <DashboardConductor />;
}

