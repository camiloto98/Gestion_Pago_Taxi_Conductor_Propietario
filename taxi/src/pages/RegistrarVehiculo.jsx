import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function RegistrarVehiculo() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ placa: '', marca: '', modelo: '', año: '', color: '' });
  const [busy, setBusy] = useState(false);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/vehiculos', {
        placa: form.placa,
        marca: form.marca || null,
        modelo: form.modelo || null,
        año: form.año ? Number(form.año) : null,
        color: form.color || null,
      });
      toast.success('Vehículo registrado');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'No se pudo registrar el vehículo');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container" style={{ padding: 'clamp(16px, 3vw, 26px) 0 50px' }}>
      <div className="glass" style={{ borderRadius: 22, padding: 'clamp(14px, 3vw, 18px)', maxWidth: 640 }}>
        <div className="title-display--md">Registrar vehículo</div>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>Placa</div>
            <Input value={form.placa} onChange={(e) => setField('placa', e.target.value)} placeholder="ABC123" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>Marca</div>
              <Input value={form.marca} onChange={(e) => setField('marca', e.target.value)} placeholder="Chevrolet" />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>Modelo</div>
              <Input value={form.modelo} onChange={(e) => setField('modelo', e.target.value)} placeholder="Spark" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>Año</div>
              <Input value={form.año} onChange={(e) => setField('año', e.target.value)} placeholder="2020" />
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>Color</div>
              <Input value={form.color} onChange={(e) => setField('color', e.target.value)} placeholder="Amarillo" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button disabled={busy} type="submit">
              {busy ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

