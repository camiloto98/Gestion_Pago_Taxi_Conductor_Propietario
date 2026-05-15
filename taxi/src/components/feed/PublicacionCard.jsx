import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Heart, MessageCircle } from 'lucide-react';
import api from '../../services/api';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Input from '../ui/Input';

function badgeForTipo(tipo) {
  if (tipo === 'retén') return { color: 'danger', label: '🚨 RETÉN' };
  if (tipo === 'paro') return { color: 'warning', label: '✊ PARO' };
  if (tipo === 'alerta') return { color: 'taxi', label: '⚠️ ALERTA' };
  return { color: 'info', label: '📢 GENERAL' };
}

export default function PublicacionCard({ post, onChanged }) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [texto, setTexto] = useState('');
  const badge = badgeForTipo(post.tipo);

  useEffect(() => {
    if (!commentsOpen) return;
    api
      .get(`/feed/${post.id}/comentarios`)
      .then((r) => setComments(r.data))
      .catch(() => setComments([]));
  }, [commentsOpen, post.id]);

  async function like() {
    try {
      await api.post(`/feed/${post.id}/like`);
      onChanged?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'No se pudo dar like');
    }
  }

  async function comentar() {
    const t = texto.trim();
    if (!t) return;
    try {
      await api.post(`/feed/${post.id}/comentar`, { texto: t });
      setTexto('');
      const { data } = await api.get(`/feed/${post.id}/comentarios`);
      setComments(data);
      onChanged?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'No se pudo comentar');
    }
  }

  return (
    <div className="glass feedCard" style={{ borderRadius: 22, padding: 16 }}>
      <div className="feedCard__top">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="feedAvatar">
            {post.autor_avatar ? <img alt={post.autor_nombre} src={post.autor_avatar} /> : <span>{(post.autor_nombre || 'U')[0]}</span>}
          </div>
          <div style={{ display: 'grid', gap: 2 }}>
            <div style={{ fontWeight: 900 }}>
              {post.autor_nombre} <span style={{ opacity: 0.7, fontWeight: 600 }}>· {post.autor_rol}</span>
            </div>
            <div style={{ opacity: 0.7, fontSize: 12 }}>
              {post.creado_en ? new Date(post.creado_en).toLocaleString() : ''}
            </div>
          </div>
        </div>
        <Badge color={badge.color}>{badge.label}</Badge>
      </div>

      {post.titulo ? <div className="feedTitle">{post.titulo}</div> : null}
      <div style={{ marginTop: 8, opacity: 0.92, whiteSpace: 'pre-wrap' }}>{post.contenido}</div>

      {post.imagen_url ? (
        <div className="feedImg">
          <img alt="Publicación" src={`http://localhost:3001${post.imagen_url}`} />
        </div>
      ) : null}

      <div className="feedMeta">
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div className="feedMeta__pill">
            <Heart size={16} /> {post.likes}
          </div>
          <div className="feedMeta__pill">
            <MessageCircle size={16} /> {post.comentarios_count}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="ghost" onClick={like}>
            Me gusta
          </Button>
          <Button variant="ghost" onClick={() => setCommentsOpen((v) => !v)}>
            Comentar
          </Button>
        </div>
      </div>

      {commentsOpen ? (
        <div className="feedComments">
          <div style={{ display: 'grid', gap: 10 }}>
            {comments.length ? (
              comments.map((c) => (
                <div key={c.id} className="comentarioItem">
                  <div className="comentarioMeta">
                    <span style={{ fontWeight: 900 }}>{c.autor_nombre}</span>
                    <span style={{ opacity: 0.7, fontSize: 12 }}>
                      {c.creado_en ? new Date(c.creado_en).toLocaleString() : ''}
                    </span>
                  </div>
                  <div style={{ opacity: 0.92 }}>{c.texto}</div>
                </div>
              ))
            ) : (
              <div style={{ opacity: 0.8, fontSize: 13 }}>Sin comentarios aún.</div>
            )}
          </div>
          <div className="comentarioBox" style={{ marginTop: 12 }}>
            <Input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe un comentario…" />
            <Button type="button" onClick={comentar}>
              Enviar
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

