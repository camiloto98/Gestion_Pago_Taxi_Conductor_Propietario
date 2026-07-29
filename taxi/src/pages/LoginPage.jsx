import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(email, password);
      navigate('/dashboard', { replace: true, state: { rol: user.rol } });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container" style={{ padding: 'clamp(24px, 5vw, 48px) 0' }}>
      <div className="glass" style={{ borderRadius: 22, padding: 'clamp(16px, 3vw, 22px)', maxWidth: 520, margin: '0 auto' }}>
        <div className="title-display--md">Iniciar sesión</div>
        <div style={{ opacity: 0.85, marginTop: 6 }}>Accede a tu calendario y a la comunidad.</div>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 18 }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>Email</div>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="tu@email.com" />
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>Contraseña</div>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
            />
          </div>

          <Button disabled={busy} type="submit">
            {busy ? 'Entrando…' : 'Entrar'}
          </Button>
          <div style={{ fontSize: 13, opacity: 0.85 }}>
            ¿No tienes cuenta? <Link to="/register" style={{ color: 'var(--amarillo-taxi)' }}>Regístrate</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

