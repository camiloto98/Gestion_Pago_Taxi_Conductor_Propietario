import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import CrearPublicacion from '../components/feed/CrearPublicacion';
import PublicacionCard from '../components/feed/PublicacionCard';

export default function FeedPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  async function load(p = 1) {
    if (p === 1) setLoading(true);
    try {
      const { data } = await api.get('/feed', { params: { page: p, limit: 10 } });
      if (p === 1) setItems(data.items);
      else setItems((prev) => [...prev, ...data.items]);
      setHasMore(data.items.length === 10);
      setPage(p);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'No se pudo cargar el feed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
  }, []);

  return (
    <div className="container" style={{ padding: 'clamp(14px, 3vw, 22px) 0 70px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="title-display">Comunidad</div>
          <div style={{ opacity: 0.85 }}>Alertas y novedades de la ciudad</div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        {loading ? (
          <div className="glass" style={{ borderRadius: 22, padding: 16, opacity: 0.9 }}>
            Cargando publicaciones…
          </div>
        ) : items.length ? (
          items.map((p) => (
            <PublicacionCard
              key={p.id}
              post={p}
              onChanged={() => load(1)}
            />
          ))
        ) : (
          <div className="glass" style={{ borderRadius: 22, padding: 16, opacity: 0.9 }}>
            Aún no hay publicaciones.
          </div>
        )}

        {hasMore ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
            <Button variant="ghost" onClick={() => load(page + 1)}>
              Cargar más
            </Button>
          </div>
        ) : null}
      </div>

      <button className="fab" onClick={() => setOpen(true)} aria-label="Nueva publicación">
        <Plus size={22} />
      </button>

      <Modal open={open} title="Nueva publicación" onClose={() => setOpen(false)}>
        <CrearPublicacion
          onCreated={() => {
            setOpen(false);
            load(1);
          }}
        />
      </Modal>
    </div>
  );
}

