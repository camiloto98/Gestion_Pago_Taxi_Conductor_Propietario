import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

function TaxiSilhouette({ className, style }) {
  return (
    <svg
      className={className}
      style={style}
      width="220"
      height="100"
      viewBox="0 0 220 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M40 62c2-14 12-28 26-30l66-10c14-2 32 6 40 18l10 22h14c8 0 14 6 14 14v8H20v-6c0-10 8-16 20-16h0Z"
        stroke="rgba(255,215,0,0.55)"
        strokeWidth="2"
      />
      <path d="M66 40h82" stroke="rgba(255,215,0,0.25)" strokeWidth="2" />
      <circle cx="60" cy="82" r="10" stroke="rgba(255,215,0,0.65)" strokeWidth="2" />
      <circle cx="156" cy="82" r="10" stroke="rgba(255,215,0,0.65)" strokeWidth="2" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="grid-city" />

      <TaxiSilhouette
        className="taxiFloat"
        style={{ position: 'absolute', top: 120, left: '6%', opacity: 0.18, filter: 'blur(0.3px)' }}
      />
      <TaxiSilhouette
        className="taxiFloat"
        style={{ position: 'absolute', top: 260, right: '8%', opacity: 0.14, transform: 'scale(1.05)' }}
      />
      <TaxiSilhouette
        className="taxiFloat"
        style={{ position: 'absolute', bottom: 120, left: '18%', opacity: 0.1, transform: 'scale(0.9)' }}
      />

      <div className="container" style={{ padding: '72px 0 64px' }}>
        <motion.div
          className="glass"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          style={{ padding: 26, borderRadius: 22, position: 'relative' }}
        >
          <div style={{ display: 'grid', gap: 14, textAlign: 'left' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 68, letterSpacing: 1.5, lineHeight: 0.92 }}>
              <span
                style={{
                  background: 'linear-gradient(90deg, var(--amarillo-taxi), var(--amarillo-oscuro))',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                TAXICATOR
              </span>
            </div>
            <div style={{ maxWidth: 740, opacity: 0.9, fontSize: 16 }}>
              Calendario de pagos con comprobantes, comentarios del propietario y comunidad de alertas para conductores.
              Todo en un diseño oscuro, limpio y rápido.
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 6 }}>
              <Link to="/register">
                <Button>Crear cuenta</Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost">Iniciar sesión</Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

