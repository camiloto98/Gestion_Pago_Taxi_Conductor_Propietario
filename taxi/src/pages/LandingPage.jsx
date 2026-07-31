import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import TaxicatorWordmark from '../components/brand/TaxicatorWordmark';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <div className="container landing-page__inner">
        <motion.div
          className="glass landing-page__card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <TaxicatorWordmark variant="hero" />

          <p className="landing-page__desc">
            Calendario de pagos con comprobantes, comentarios del propietario y comunidad de alertas para conductores.
            Todo en un diseño oscuro, limpio y rápido.
          </p>

          <div className="landing-page__actions">
            <Link to="/register">
              <Button>Crear cuenta</Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost">Iniciar sesión</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
