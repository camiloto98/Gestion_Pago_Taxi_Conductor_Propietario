import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw } from 'lucide-react';
import {
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
  addDays,
} from 'date-fns';
import api from '../../services/api';
import { assetUrl } from '../../config/env';
import DiaCell from './DiaCell';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';

function ymd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildGrid(monthDate) {
  const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 0 });
  const days = [];
  let cur = start;
  while (cur <= end) {
    days.push(cur);
    cur = addDays(cur, 1);
  }
  return days;
}

export default function CalendarioGrid({ vehiculoId, mes, año, rol }) {
  const monthDate = useMemo(() => new Date(año, mes - 1, 1), [año, mes]);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedPago, setSelectedPago] = useState(null);

  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [comentarios, setComentarios] = useState([]);
  const [comentarioTexto, setComentarioTexto] = useState('');

  const pagosByDate = useMemo(() => {
    const map = new Map();
    for (const p of pagos) map.set(String(p.fecha).slice(0, 10), p);
    return map;
  }, [pagos]);

  const days = useMemo(() => buildGrid(monthDate), [monthDate]);

  const stats = useMemo(() => {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const now = new Date();
    const now0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endCount = isWithinInterval(now0, { start, end }) ? now0 : end;
    const transcurridos = Math.max(0, Math.min(end.getDate(), endCount.getDate()));

    let pagados = 0;
    for (const p of pagos) {
      const d = new Date(`${p.fecha}T00:00:00`);
      if (isSameMonth(d, monthDate)) pagados += 1;
    }
    return { pagados, transcurridos };
  }, [pagos, monthDate]);

  const cargarPagos = useCallback(
    async ({ silencioso = false } = {}) => {
      if (!silencioso) setLoading(true);
      else setSyncing(true);
      try {
        const { data } = await api.get(`/pagos/${vehiculoId}/${año}/${mes}`); // ruta: /:vehiculoId/:year/:month
        setPagos(data);
        if (silencioso) toast.success('Calendario sincronizado con el servidor');
      } catch (err) {
        toast.error(err?.response?.data?.message || 'No se pudieron cargar los pagos del mes');
      } finally {
        setLoading(false);
        setSyncing(false);
      }
    },
    [vehiculoId, año, mes]
  );

  useEffect(() => {
    let alive = true;
    cargarPagos().finally(() => { if (!alive) return; });
    return () => { alive = false; };
  }, [cargarPagos]);

  useEffect(() => {
    if (!file) {
      setFilePreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function onCellClick(date, pago) {
    setSelectedDate(date);
    setSelectedPago(pago || null);
    setComentarios([]);
    setComentarioTexto('');
    if (rol === 'conductor') {
      setUploadOpen(true);
    } else {
      setViewOpen(true);
      if (pago?.id) {
        api
          .get(`/comentarios/${pago.id}`)
          .then((r) => setComentarios(r.data))
          .catch(() => setComentarios([]));
      }
    }
  }

  async function submitUpload() {
    if (!selectedDate) return;
    if (!file) {
      toast.error('Selecciona una imagen JPG/PNG');
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append('vehiculoId', String(vehiculoId));
      form.append('fecha', ymd(selectedDate));
      form.append('imagen', file);
      await api.post('/pagos', form);
      await cargarPagos();
      toast.success('¡Pago guardado y sincronizado!');
      setUploadOpen(false);
      setFile(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'No se pudo subir el pago');
    } finally {
      setBusy(false);
    }
  }

  async function enviarComentario() {
    if (!selectedPago?.id) return;
    const texto = comentarioTexto.trim();
    if (!texto) return;
    try {
      await api.post('/comentarios', { pagoId: selectedPago.id, texto });
      setComentarioTexto('');
      const { data } = await api.get(`/comentarios/${selectedPago.id}`);
      setComentarios(data);
      setPagos((prev) =>
        prev.map((p) =>
          p.id === selectedPago.id
            ? { ...p, comentarios_count: Number(p.comentarios_count || 0) + 1 }
            : p
        )
      );
      toast.success('Comentario enviado');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'No se pudo comentar');
    }
  }

  return (
    <div className="calWrap glass" style={{ borderRadius: 22, padding: 14 }}>
      <div className="calTop">
        <div className="calCounter">
          <span className="calCounter__num">{stats.pagados}</span> días pagados /{' '}
          <span className="calCounter__num">{stats.transcurridos}</span> transcurridos
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="calHint">{rol === 'conductor' ? 'Clic en un día para subir' : 'Clic en un pago para ver y comentar'}</div>
          <button
            className="calNavBtn"
            title="Sincronizar con el servidor"
            disabled={syncing || loading}
            onClick={() => cargarPagos({ silencioso: true })}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <RefreshCw size={16} style={{ animation: syncing ? 'spin 0.8s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      <div className="calWeekdays">
        {['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'].map((d) => (
          <div key={d} className="calWeekdays__cell">
            {d}
          </div>
        ))}
      </div>

      <div className="calGrid">
        {loading ? (
          <div style={{ padding: 18, opacity: 0.85 }}>Cargando calendario…</div>
        ) : (
          days.map((date, idx) => {
            const key = ymd(date);
            const pago = pagosByDate.get(key) || null;
            return (
              <DiaCell
                key={key}
                date={date}
                monthDate={monthDate}
                pago={pago}
                rol={rol}
                onClick={onCellClick}
                hasComment={Number(pago?.comentarios_count || 0) > 0}
                index={idx}
              />
            );
          })
        )}
      </div>

      <Modal
        open={uploadOpen}
        title={`📅 Subir pago — ${selectedDate ? format(selectedDate, "EEEE d 'de' MMMM") : ''}`}
        onClose={() => {
          if (busy) return;
          setUploadOpen(false);
          setFile(null);
        }}
        footer={
          <>
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                if (busy) return;
                setUploadOpen(false);
                setFile(null);
              }}
            >
              Cancelar
            </Button>
            <Button disabled={busy} type="button" onClick={submitUpload}>
              {busy ? 'Guardando…' : 'Guardar pago'}
            </Button>
          </>
        }
      >
        <label className="uploadBox">
          <input
            type="file"
            accept="image/jpeg,image/png"
            style={{ display: 'none' }}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <div style={{ fontWeight: 800 }}>Arrastra o haz clic para subir</div>
          <div style={{ opacity: 0.85, fontSize: 13 }}>Solo JPG/PNG • Máx. 5MB</div>
        </label>
        {filePreview ? (
          <div className="uploadPreview">
            <img alt="Vista previa" src={filePreview} />
          </div>
        ) : null}
      </Modal>

      <Modal
        open={viewOpen}
        title={`🚕 Pago del Conductor — ${selectedDate ? format(selectedDate, "EEEE d 'de' MMMM") : ''}`}
        onClose={() => setViewOpen(false)}
        footer={
          <Button variant="ghost" type="button" onClick={() => setViewOpen(false)}>
            Cerrar
          </Button>
        }
      >
        {selectedPago?.imagen_url ? (
          <div className="pagoImg">
            <img alt="Comprobante" src={assetUrl(selectedPago.imagen_url)} />
          </div>
        ) : (
          <div style={{ opacity: 0.85 }}>No hay comprobante para este día.</div>
        )}

        {selectedPago?.id ? (
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ fontWeight: 900 }}>💬 Comentarios ({comentarios.length})</div>
            </div>

            <div className="comentariosList">
              {comentarios.length ? (
                comentarios.map((c) => (
                  <div key={c.id} className="comentarioItem">
                    <div className="comentarioMeta">
                      <span style={{ fontWeight: 900 }}>{c.propietario_nombre || 'Propietario'}</span>
                      <span style={{ opacity: 0.7, fontSize: 12 }}>
                        {c.creado_en ? format(new Date(c.creado_en), 'PP p') : ''}
                      </span>
                    </div>
                    <div style={{ opacity: 0.92 }}>{c.texto}</div>
                  </div>
                ))
              ) : (
                <div style={{ opacity: 0.8, fontSize: 13 }}>Sin comentarios aún.</div>
              )}
            </div>

            <div className="comentarioBox">
              <Input
                value={comentarioTexto}
                onChange={(e) => setComentarioTexto(e.target.value)}
                placeholder="Escribe un comentario…"
              />
              <Button type="button" onClick={enviarComentario}>
                Enviar
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

