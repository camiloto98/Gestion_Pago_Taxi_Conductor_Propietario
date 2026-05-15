import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Button from '../components/ui/Button';

export default function DashboardConductor() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/vehiculos/vinculados');
        setVehiculos(data);
      } catch (err) {
        toast.error(err?.response?.data?.message || 'No se pudieron cargar los vehículos');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="container" style={{ padding: '22px 0 50px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 44, letterSpacing: 1.2 }}>Dashboard</div>
          <div style={{ opacity: 0.85 }}>Conductor</div>
        </div>
        <Link to="/vehiculos/unirse">
          <Button>Unirme con código</Button>
        </Link>
      </div>

      <div style={{ marginTop: 18 }} className="glass">
        <div style={{ padding: 16, borderBottom: '1px solid rgba(255,215,0,0.12)' }}>
          <div style={{ fontWeight: 800 }}>Vehículos vinculados</div>
        </div>
        <div style={{ padding: 16 }}>
          {loading ? (
            <div style={{ opacity: 0.85 }}>Cargando…</div>
          ) : vehiculos.length ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {vehiculos.map((v) => (
                <div key={v.id} className="vehRow">
                  <div style={{ display: 'grid', gap: 2 }}>
                    <div style={{ fontWeight: 800 }}>{v.placa}</div>
                    <div style={{ opacity: 0.8, fontSize: 13 }}>
                      Propietario: {v.propietario_nombre || '—'}
                    </div>
                  </div>
                  <Link to={`/calendario/${v.id}`}>
                    <Button variant="ghost">Ver calendario</Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ opacity: 0.85 }}>
              Aún no estás vinculado a ningún vehículo. Usa un código del propietario.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

