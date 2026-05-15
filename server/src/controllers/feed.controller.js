const pool = require('../config/db');

async function listFeed(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(30, Math.max(5, Number(req.query.limit || 10)));
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT p.id, p.autor_id, p.tipo, p.titulo, p.contenido, p.imagen_url, p.likes, p.creado_en,
              u.nombre AS autor_nombre, u.rol AS autor_rol, u.avatar_url AS autor_avatar,
              EXISTS(
                SELECT 1 FROM likes_publicaciones l
                WHERE l.user_id = :user_id AND l.publicacion_id = p.id
              ) AS liked_by_me,
              (
                SELECT COUNT(*)
                FROM comentarios_feed c
                WHERE c.publicacion_id = p.id
              ) AS comentarios_count
       FROM publicaciones p
       JOIN users u ON u.id = p.autor_id
       ORDER BY p.creado_en DESC
       LIMIT :limit OFFSET :offset`,
      { user_id: userId, limit, offset }
    );

    return res.json({ page, limit, items: rows });
  } catch (err) {
    return next(err);
  }
}

async function createPost(req, res, next) {
  try {
    const autorId = req.user.id;
    const { tipo, titulo, contenido } = req.body || {};
    if (!contenido) return res.status(400).json({ message: 'contenido es obligatorio' });
    const safeTipo = ['retén', 'paro', 'alerta', 'general'].includes(tipo) ? tipo : 'general';

    const imagen_url = req.file ? `/static/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO publicaciones (autor_id, tipo, titulo, contenido, imagen_url, likes)
       VALUES (:autor_id, :tipo, :titulo, :contenido, :imagen_url, 0)`,
      { autor_id: autorId, tipo: safeTipo, titulo: titulo || null, contenido, imagen_url }
    );

    return res.status(201).json({
      id: result.insertId,
      autor_id: autorId,
      tipo: safeTipo,
      titulo: titulo || null,
      contenido,
      imagen_url,
      likes: 0,
    });
  } catch (err) {
    return next(err);
  }
}

async function likePost(req, res, next) {
  try {
    const userId = req.user.id;
    const postId = Number(req.params.id);
    if (!postId) return res.status(400).json({ message: 'id inválido' });

    await pool.query(
      `INSERT IGNORE INTO likes_publicaciones (user_id, publicacion_id)
       VALUES (:user_id, :publicacion_id)`,
      { user_id: userId, publicacion_id: postId }
    );

    await pool.query(
      `UPDATE publicaciones
       SET likes = (SELECT COUNT(*) FROM likes_publicaciones WHERE publicacion_id = :id)
       WHERE id = :id`,
      { id: postId }
    );

    const [rows] = await pool.query('SELECT likes FROM publicaciones WHERE id = :id', { id: postId });
    if (!rows.length) return res.status(404).json({ message: 'Publicación no encontrada' });
    return res.json({ likes: rows[0].likes });
  } catch (err) {
    return next(err);
  }
}

async function comentar(req, res, next) {
  try {
    const autorId = req.user.id;
    const postId = Number(req.params.id);
    const { texto } = req.body || {};
    if (!postId) return res.status(400).json({ message: 'id inválido' });
    if (!texto) return res.status(400).json({ message: 'texto es obligatorio' });

    const [exists] = await pool.query('SELECT id FROM publicaciones WHERE id = :id', { id: postId });
    if (!exists.length) return res.status(404).json({ message: 'Publicación no encontrada' });

    const [result] = await pool.query(
      `INSERT INTO comentarios_feed (publicacion_id, autor_id, texto)
       VALUES (:publicacion_id, :autor_id, :texto)`,
      { publicacion_id: postId, autor_id: autorId, texto }
    );
    return res.status(201).json({ id: result.insertId, publicacion_id: postId, autor_id: autorId, texto });
  } catch (err) {
    return next(err);
  }
}

async function listComentarios(req, res, next) {
  try {
    const postId = Number(req.params.id);
    if (!postId) return res.status(400).json({ message: 'id inválido' });

    const [rows] = await pool.query(
      `SELECT c.id, c.publicacion_id, c.autor_id, c.texto, c.creado_en,
              u.nombre AS autor_nombre, u.rol AS autor_rol, u.avatar_url AS autor_avatar
       FROM comentarios_feed c
       JOIN users u ON u.id = c.autor_id
       WHERE c.publicacion_id = :id
       ORDER BY c.creado_en ASC`,
      { id: postId }
    );
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
}

module.exports = { listFeed, createPost, likePost, comentar, listComentarios };

