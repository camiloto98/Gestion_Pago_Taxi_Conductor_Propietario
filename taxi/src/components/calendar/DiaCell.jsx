import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { isSameMonth, isToday } from 'date-fns';
import { assetUrl } from '../../config/env';

function statusFor({ date, monthDate, pago }) {
  if (!isSameMonth(date, monthDate)) return 'out';
  if (pago) return 'paid';
  const now = new Date();
  const d0 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const n0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (d0 < n0) return 'missed';
  return 'neutral';
}

export default function DiaCell({
  date,
  monthDate,
  pago,
  rol,
  onClick,
  hasComment,
  index,
}) {
  const status = statusFor({ date, monthDate, pago });
  const disabled = status === 'out' || (rol === 'propietario' && !pago) || (rol === 'conductor' && status === 'neutral');

  return (
    <motion.button
      className={`diaCell diaCell--${status} ${isToday(date) ? 'diaCell--today' : ''}`.trim()}
      onClick={() => {
        if (!disabled) onClick?.(date, pago);
      }}
      disabled={disabled}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.015 }}
      whileHover={disabled ? undefined : { scale: 1.01 }}
    >
      <div className="diaCell__num">{date.getDate()}</div>
      <div className="diaCell__icon">
        {status === 'paid' ? <Check size={18} /> : null}
        {status === 'missed' ? <X size={18} /> : null}
      </div>
      {hasComment ? <div className="diaCell__dot" /> : null}

      {pago?.imagen_url ? (
        <div className="diaCell__thumb">
          <img alt="Comprobante" src={assetUrl(pago.imagen_url)} />
        </div>
      ) : null}
      {pago?.imagen_url && rol === 'propietario' ? (
        <div className="diaCell__badge">JPG</div>
      ) : null}
    </motion.button>
  );
}

