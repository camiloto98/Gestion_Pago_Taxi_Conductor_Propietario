import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

export default function DashboardPropietario() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tokenModal, setTokenModal] = useState({ open: false, codigo: '', vehiculoPlaca: '' });
  const [copied, setCopied] = useState(false);

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

  async function generarToken(vehiculoId, placa) {
    try {
      const { data } = await api.post('/tokens/generar', { vehiculoId });
      setTokenModal({ open: true, codigo: data.codigo, vehiculoPlaca: placa });
      setCopied(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'No se pudo generar el token');
    }
  }

  async function copiarToken() {
    try {
      await navigator.clipboard.writeText(tokenModal.codigo);
      setCopied(true);
      toast.success('Token copiado al portapapeles');
    } catch {
      toast.error('No se pudo copiar automáticamente');
    }
  }

  return (
    <div className="container" style={{ padding: 'clamp(14px, 3vw, 22px) 0 50px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="title-display">Dashboard</div>
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
                    <Button variant="ghost" onClick={() => generarToken(v.id, v.placa)}>
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

      <Modal
        open={tokenModal.open}
        title={`🔑 Token para ${tokenModal.vehiculoPlaca}`}
        onClose={() => setTokenModal({ ...tokenModal, open: false })}
        footer={
          <Button variant="ghost" type="button" onClick={() => setTokenModal({ ...tokenModal, open: false })}>
            Cerrar
          </Button>
        }
      >
        <div style={{ display: 'grid', gap: 16, textAlign: 'center' }}>
          <div style={{ opacity: 0.85, fontSize: 14 }}>
            Comparte este código con el conductor para que se vincule:
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: 4,
              color: 'var(--amarillo-taxi)',
              background: 'rgba(255,215,0,0.06)',
              border: '1px solid rgba(255,215,0,0.2)',
              borderRadius: 16,
              padding: '16px 12px',
            }}
          >
            {tokenModal.codigo}
          </div>
          <Button onClick={copiarToken} style={{ justifyContent: 'center' }}>
            {copied ? (
              <>
                <Check size={18} /> Copiado
              </>
            ) : (
              <>
                <Copy size={18} /> Copiar token
              </>
            )}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

