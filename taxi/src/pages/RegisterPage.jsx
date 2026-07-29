import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'conductor' });
  const [busy, setBusy] = useState(false);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await register(form);
      navigate('/dashboard', { replace: true, state: { rol: user.rol } });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al registrarse');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container" style={{ padding: 'clamp(24px, 5vw, 48px) 0' }}>
      <div className="glass" style={{ borderRadius: 22, padding: 'clamp(16px, 3vw, 22px)', maxWidth: 560, margin: '0 auto' }}>
        <div className="title-display--md">Crear cuenta</div>
        <div style={{ opacity: 0.85, marginTop: 6 }}>Elige tu rol y empieza a usar TaxiPay.</div>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 18 }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>Nombre</div>
            <Input value={form.nombre} onChange={(e) => setField('nombre', e.target.value)} placeholder="Juan Pérez" />
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>Email</div>
            <Input value={form.email} onChange={(e) => setField('email', e.target.value)} type="email" placeholder="tu@email.com" />
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>Contraseña</div>
            <Input
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              type="password"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>Rol</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`roleChip ${form.rol === 'conductor' ? 'roleChip--active' : ''}`}
                onClick={() => setField('rol', 'conductor')}
              >
                Conductor
              </button>
              <button
                type="button"
                className={`roleChip ${form.rol === 'propietario' ? 'roleChip--active' : ''}`}
                onClick={() => setField('rol', 'propietario')}
              >
                Propietario
              </button>
            </div>
          </div>

          <Button disabled={busy} type="submit">
            {busy ? 'Creando…' : 'Registrarme'}
          </Button>
          <div style={{ fontSize: 13, opacity: 0.85 }}>
            ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--amarillo-taxi)' }}>Inicia sesión</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

