import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function UnirseVehiculo() {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/tokens/unirse', { codigo: codigo.trim().toUpperCase() });
      toast.success('Vinculado correctamente');
      navigate(`/calendario/${data.vehiculoId}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'No se pudo vincular');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container" style={{ padding: 'clamp(16px, 3vw, 26px) 0 50px' }}>
      <div className="glass" style={{ borderRadius: 22, padding: 'clamp(14px, 3vw, 18px)', maxWidth: 520 }}>
        <div className="title-display--md">Unirme a vehículo</div>
        <div style={{ opacity: 0.85, marginTop: 6, fontFamily: 'var(--font-mono)' }}>Ej: TXI-4F9K</div>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <Input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="TXI-4F9K" />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button disabled={busy} type="submit">
              {busy ? 'Uniendo…' : 'Unirme'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

