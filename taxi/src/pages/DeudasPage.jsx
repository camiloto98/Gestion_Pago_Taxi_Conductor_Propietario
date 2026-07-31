import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, ArrowDownCircle, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';

// Formato moneda colombiana: $300.000 (puntos de miles)
const fmt = (n) => {
  const valor = Math.round(Number(n || 0));
  const str = String(Math.abs(valor));
  const conPuntos = str.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${valor < 0 ? '-' : ''}$${conPuntos}`;
};

// Formatea solo dígitos con puntos de miles (estilo colombiano): "300000" -> "300.000"
function formatearMiles(valor) {
  if (!valor) return '';
  const soloDigitos = String(valor).replace(/\D/g, '');
  if (!soloDigitos) return '';
  return soloDigitos.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Convierte un valor escrito con puntos de miles a número: "300.000" -> 300000
function aNumero(valor) {
  if (!valor) return 0;
  const soloDigitos = String(valor).replace(/\D/g, '');
  return soloDigitos ? Number(soloDigitos) : 0;
}

function formatFecha(v) {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v).slice(0, 10);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DeudasPage() {
  const { vehiculoId } = useParams();
  const { user } = useAuth();
  const vehiculo_id = Number(vehiculoId);
  const esPropietario = user?.rol === 'propietario';

  const [deudas, setDeudas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Crear deuda
  const [crearOpen, setCrearOpen] = useState(false);
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [busyCrear, setBusyCrear] = useState(false);

  // Abonar
  const [abonoTarget, setAbonoTarget] = useState(null);
  const [abonoMonto, setAbonoMonto] = useState('');
  const [abonoComentario, setAbonoComentario] = useState('');
  const [abonos, setAbonos] = useState([]);
  const [busyAbono, setBusyAbono] = useState(false);

  const cargarDeudas = useCallback(
    async ({ silencioso = false } = {}) => {
      if (!silencioso) setLoading(true);
      else setSyncing(true);
      try {
        const { data } = await api.get(`/deudas/vehiculo/${vehiculo_id}`);
        setDeudas(data);
        if (silencioso) toast.success('Deudas sincronizadas');
      } catch (err) {
        toast.error(err?.response?.data?.message || 'No se pudieron cargar las deudas');
      } finally {
        setLoading(false);
        setSyncing(false);
      }
    },
    [vehiculo_id]
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get(`/deudas/vehiculo/${vehiculo_id}`);
        if (!alive) return;
        setDeudas(data);
      } catch (err) {
        if (!alive) return;
        toast.error(err?.response?.data?.message || 'No se pudieron cargar las deudas');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [vehiculo_id]);

  const totalSaldo = useMemo(
    () => deudas.reduce((acc, d) => acc + Number(d.saldo || 0), 0),
    [deudas]
  );

  async function crearDeuda() {
    const montoNum = aNumero(monto);
    if (!vehiculo_id) return;
    if (!montoNum || montoNum <= 0) {
      toast.error('Ingresa un monto válido');
      return;
    }
    if (!descripcion.trim()) {
      toast.error('Escribe una descripción de la deuda');
      return;
    }
    setBusyCrear(true);
    try {
      await api.post('/deudas', {
        vehiculoId: vehiculo_id,
        monto: montoNum,
        descripcion: descripcion.trim(),
      });
      toast.success('Deuda registrada');
      setMonto('');
      setDescripcion('');
      setCrearOpen(false);
      await cargarDeudas();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'No se pudo registrar la deuda');
    } finally {
      setBusyCrear(false);
    }
  }

  async function eliminarDeuda(deuda) {
    if (!window.confirm(`¿Eliminar la deuda "${deuda.descripcion || 'Deuda'}" por ${fmt(deuda.monto)}? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/deudas/${deuda.id}`);
      toast.success('Deuda eliminada');
      await cargarDeudas({ silencioso: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'No se pudo eliminar la deuda');
    }
  }

  async function abrirAbono(deuda) {
    setAbonoTarget(deuda);
    setAbonoMonto('');
    setAbonoComentario('');
    setAbonos([]);
    try {
      const { data } = await api.get(`/deudas/${deuda.id}/abonos`);
      setAbonos(data);
    } catch {
      setAbonos([]);
    }
  }

  async function enviarAbono() {
    if (!abonoTarget) return;
    const montoNum = aNumero(abonoMonto);
    if (!montoNum || montoNum <= 0) {
      toast.error('Ingresa un monto de abono válido');
      return;
    }
    if (montoNum > Number(abonoTarget.saldo)) {
      toast.error(`El abono excede el saldo pendiente de ${fmt(abonoTarget.saldo)}`);
      return;
    }
    setBusyAbono(true);
    try {
      await api.post(`/deudas/${abonoTarget.id}/abonar`, {
        monto: montoNum,
        comentario: abonoComentario.trim() || null,
      });
      toast.success('Abono registrado correctamente');
      setAbonoMonto('');
      setAbonoComentario('');
      setAbonoTarget(null);
      await cargarDeudas({ silencioso: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'No se pudo registrar el abono');
    } finally {
      setBusyAbono(false);
    }
  }

  return (
    <div className="container" style={{ padding: 'clamp(14px, 3vw, 22px) 0 50px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="title-display">Deudas</div>
          <div style={{ opacity: 0.85, fontFamily: 'var(--font-mono)', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
            Vehículo #{vehiculo_id}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {esPropietario ? (
            <Button onClick={() => setCrearOpen(true)}>
              <Plus size={16} /> Registrar deuda
            </Button>
          ) : null}
          <button
            className="calNavBtn"
            title="Sincronizar deudas"
            disabled={syncing || loading}
            onClick={() => cargarDeudas({ silencioso: true })}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <RefreshCw size={16} style={{ animation: syncing ? 'spin 0.8s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16, borderRadius: 18 }} className="glass">
        <div style={{ padding: 16, borderBottom: '1px solid rgba(255,215,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 800 }}>Resumen de deudas</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, opacity: 0.9 }}>
            Total pendiente: <span style={{ color: totalSaldo > 0 ? '#ff7a92' : 'var(--amarillo-taxi)', fontWeight: 800 }}>{fmt(totalSaldo)}</span>
          </div>
        </div>
        <div style={{ padding: 16 }}>
          {loading ? (
            <div style={{ opacity: 0.85 }}>Cargando deudas…</div>
          ) : deudas.length ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {deudas.map((d) => (
                <div key={d.id} className="deudaCard">
                  <div className="deudaCard__head">
                    <div style={{ display: 'grid', gap: 2 }}>
                      <div style={{ fontWeight: 800 }}>{d.descripcion || 'Deuda'}</div>
                      <div style={{ opacity: 0.75, fontSize: 13 }}>
                        Conductor: {d.conductor_nombre || '—'} • {formatFecha(d.creado_en)}
                      </div>
                    </div>
                    <Badge color={Number(d.saldo) > 0 ? 'danger' : 'taxi'}>
                      {Number(d.saldo) > 0 ? fmt(d.saldo) : 'Pagada'}
                    </Badge>
                  </div>
                  <div className="deudaCard__stats">
                    <div>
                      <span style={{ opacity: 0.7 }}>Deuda:</span> {fmt(d.monto)}
                    </div>
                    <div>
                      <span style={{ opacity: 0.7 }}>Abonado:</span> {fmt(d.total_abonado)}
                    </div>
                    <div>
                      <span style={{ opacity: 0.7 }}>Abonos:</span> {d.abonos_count || 0}
                    </div>
                  </div>
                  <div className="deudaCard__actions">
                    {Number(d.saldo) > 0 ? (
                      <Button variant="ghost" onClick={() => abrirAbono(d)}>
                        <ArrowDownCircle size={16} /> Abonar
                      </Button>
                    ) : null}
                    {esPropietario ? (
                      <Button variant="danger" onClick={() => eliminarDeuda(d)}>
                        Eliminar
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ opacity: 0.85 }}>
              {esPropietario
                ? 'No hay deudas registradas para este vehículo. Usa "Registrar deuda" para añadir una.'
                : 'No tienes deudas registradas.'}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={crearOpen}
        title="➕ Registrar deuda"
        onClose={() => {
          if (busyCrear) return;
          setCrearOpen(false);
        }}
        footer={
          <>
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                if (busyCrear) return;
                setCrearOpen(false);
              }}
            >
              Cancelar
            </Button>
            <Button disabled={busyCrear} type="button" onClick={crearDeuda}>
              {busyCrear ? 'Guardando…' : 'Registrar deuda'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 6 }}>Monto de la deuda (COP)</div>
            <Input
              type="text"
              inputMode="numeric"
              value={monto}
              onChange={(e) => setMonto(formatearMiles(e.target.value))}
              placeholder="Ej: 300.000"
            />
          </div>
          <div>
            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 6 }}>Descripción / motivo</div>
            <Input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Reparación del motor, multa, etc."
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(abonoTarget)}
        title={`💰 Abonar a deuda — ${fmt(abonoTarget?.saldo || 0)} pendiente`}
        onClose={() => {
          if (busyAbono) return;
          setAbonoTarget(null);
        }}
        footer={
          <>
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                if (busyAbono) return;
                setAbonoTarget(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              disabled={busyAbono || !(aNumero(abonoMonto) > 0)}
              type="button"
              onClick={enviarAbono}
            >
              {busyAbono ? 'Abonando…' : 'Confirmar abono'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 6 }}>
              Monto del abono (COP) — máximo {fmt(abonoTarget?.saldo || 0)}
            </div>
            <Input
              type="text"
              inputMode="numeric"
              value={abonoMonto}
              onChange={(e) => setAbonoMonto(formatearMiles(e.target.value))}
              placeholder="Ej: 100.000"
            />
          </div>
          <div>
            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 6 }}>Comentario del abono</div>
            <Input
              value={abonoComentario}
              onChange={(e) => setAbonoComentario(e.target.value)}
              placeholder="Ej: Abono en efectivo del 15 de enero"
            />
          </div>
          {abonos.length ? (
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>
                Historial de abonos ({abonos.length})
              </div>
              <div style={{ display: 'grid', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
                {abonos.map((a) => (
                  <div key={a.id} className="comentarioItem">
                    <div className="comentarioMeta">
                      <span style={{ fontWeight: 900 }}>{a.usuario_nombre || 'Usuario'}</span>
                      <span style={{ opacity: 0.7, fontSize: 12 }}>{formatFecha(a.creado_en)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                      <div style={{ opacity: 0.92, fontSize: 13 }}>{a.comentario || 'Sin comentario'}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--amarillo-taxi)', whiteSpace: 'nowrap' }}>
                        {fmt(a.monto)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}