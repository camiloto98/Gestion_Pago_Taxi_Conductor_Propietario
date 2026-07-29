import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { addMonths } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import CalendarioGrid from '../components/calendar/CalendarioGrid';

export default function CalendarioPage() {
  const { vehiculoId } = useParams();
  const { user } = useAuth();
  const [cursorDate, setCursorDate] = useState(() => new Date());

  const año = cursorDate.getFullYear();
  const mes = cursorDate.getMonth() + 1; // 1-12

  const header = useMemo(() => {
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return `${months[cursorDate.getMonth()]} ${año}`;
  }, [cursorDate, año]);

  return (
    <div className="container" style={{ padding: 'clamp(14px, 3vw, 22px) 0 50px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="title-display">Calendario</div>
          <div style={{ opacity: 0.85, fontFamily: 'var(--font-mono)', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Vehículo #{vehiculoId}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="calNavBtn" onClick={() => setCursorDate((d) => addMonths(d, -1))}>
            ←
          </button>
          <div className="calHeader" style={{ fontSize: 'clamp(20px, 4vw, 28px)' }}>{header}</div>
          <button className="calNavBtn" onClick={() => setCursorDate((d) => addMonths(d, 1))}>
            →
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <CalendarioGrid vehiculoId={Number(vehiculoId)} mes={mes} año={año} rol={user?.rol} />
      </div>
    </div>
  );
}

