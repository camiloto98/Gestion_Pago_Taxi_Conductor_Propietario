import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';

export default function CrearPublicacion({ onCreated }) {
  const [tipo, setTipo] = useState('general');
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!contenido.trim()) {
      toast.error('Escribe el contenido');
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append('tipo', tipo);
      if (titulo.trim()) form.append('titulo', titulo.trim());
      form.append('contenido', contenido.trim());
      if (file) form.append('imagen', file);
      await api.post('/feed', form);
      toast.success('Publicado');
      onCreated?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'No se pudo publicar');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {[
          { id: 'retén', label: '🚨 Retén' },
          { id: 'paro', label: '✊ Paro' },
          { id: 'alerta', label: '⚠️ Alerta' },
          { id: 'general', label: '📢 General' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            className={`roleChip ${tipo === t.id ? 'roleChip--active' : ''}`}
            onClick={() => setTipo(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>Título (opcional)</div>
        <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Retén en la 80" />
      </div>
      <div>
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>Contenido</div>
        <textarea
          className="ui-input"
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          rows={5}
          placeholder="Escribe lo que está pasando…"
          style={{ resize: 'vertical' }}
        />
      </div>

      <label className="uploadBox">
        <input
          type="file"
          accept="image/jpeg,image/png"
          style={{ display: 'none' }}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <div style={{ fontWeight: 800 }}>Imagen (opcional)</div>
        <div style={{ opacity: 0.85, fontSize: 13 }}>JPG/PNG • Máx. 5MB</div>
        <div style={{ opacity: 0.85, fontSize: 13, fontFamily: 'var(--font-mono)' }}>
          {file ? file.name : 'Ningún archivo seleccionado'}
        </div>
      </label>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button disabled={busy} type="button" onClick={submit}>
          {busy ? 'Publicando…' : 'Publicar'}
        </Button>
      </div>
    </div>
  );
}

