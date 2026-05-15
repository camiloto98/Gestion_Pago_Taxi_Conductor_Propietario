import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Button from '../components/ui/Button';

export default function DashboardPropietario() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/vehiculos/mis-vehiculos');
        setVehiculos(data);
      } catch (err) {
        toast.error(err?.response?.data?.message || 'No se pudieron cargar tus vehículos');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function generarToken(vehiculoId) {
    try {
      const { data } = await api.post('/tokens/generar', { vehiculoId });
      toast.success(`Token generado: ${data.codigo}`);
      await navigator.clipboard?.writeText?.(data.codigo);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'No se pudo generar el token');
    }
  }

  return (
    <div className="container" style={{ padding: '22px 0 50px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 44, letterSpacing: 1.2 }}>Dashboard</div>
          <div style={{ opacity: 0.85 }}>Propietario</div>
        </div>
        <Link to="/vehiculos/nuevo">
          <Button>Registrar vehículo</Button>
        </Link>
      </div>

      <div style={{ marginTop: 18 }} className="glass">
        <div style={{ padding: 16, borderBottom: '1px solid rgba(255,215,0,0.12)' }}>
          <div style={{ fontWeight: 800 }}>Mis vehículos</div>
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
                      Conductor: {v.conductor_nombre || '—'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <Button variant="ghost" onClick={() => generarToken(v.id)}>
                      Generar token
                    </Button>
                    <Link to={`/calendario/${v.id}`}>
                      <Button variant="ghost">Ver calendario</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ opacity: 0.85 }}>No tienes vehículos aún. Registra el primero.</div>
          )}
        </div>
      </div>
    </div>
  );
}

