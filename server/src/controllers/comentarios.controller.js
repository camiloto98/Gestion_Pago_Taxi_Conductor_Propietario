const pool = require('../config/db');

async function createComentarioPago(req, res, next) {
  try {
    const propietarioId = req.user.id;
    const { pagoId, texto } = req.body || {};
    if (!pagoId || !texto) return res.status(400).json({ message: 'pagoId y texto son obligatorios' });

    const [rows] = await pool.query(
      `SELECT p.id, v.propietario_id
       FROM pagos_diarios p
       JOIN vehiculos v ON v.id = p.vehiculo_id
       WHERE p.id = :pago_id`,
      { pago_id: pagoId }
    );
    if (!rows.length) return res.status(404).json({ message: 'Pago no encontrado' });
    if (rows[0].propietario_id !== propietarioId) {
      return res.status(403).json({ message: 'No puedes comentar este pago' });
    }

    const [result] = await pool.query(
      `INSERT INTO comentarios_pago (pago_id, propietario_id, texto)
       VALUES (:pago_id, :propietario_id, :texto)`,
      { pago_id: pagoId, propietario_id: propietarioId, texto }
    );
    return res.status(201).json({ id: result.insertId, pago_id: pagoId, propietario_id: propietarioId, texto });
  } catch (err) {
    return next(err);
  }
}

async function getComentariosPago(req, res, next) {
  try {
    const pagoId = Number(req.params.pagoId);
    if (!pagoId) return res.status(400).json({ message: 'pagoId inválido' });

    // permiso: propietario del vehículo o conductor del pago
    const [perm] = await pool.query(
      `SELECT p.conductor_id, v.propietario_id
       FROM pagos_diarios p
       JOIN vehiculos v ON v.id = p.vehiculo_id
       WHERE p.id = :pago_id`,
      { pago_id: pagoId }
    );
    if (!perm.length) return res.status(404).json({ message: 'Pago no encontrado' });
    const allowed = perm[0].conductor_id === req.user.id || perm[0].propietario_id === req.user.id;
    if (!allowed) return res.status(403).json({ message: 'Sin acceso' });

    const [rows] = await pool.query(
      `SELECT c.id, c.pago_id, c.propietario_id, c.texto, c.creado_en,
              u.nombre AS propietario_nombre, u.avatar_url
       FROM comentarios_pago c
       JOIN users u ON u.id = c.propietario_id
       WHERE c.pago_id = :pago_id
       ORDER BY c.creado_en ASC`,
      { pago_id: pagoId }
    );
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
}

module.exports = { createComentarioPago, getComentariosPago };

