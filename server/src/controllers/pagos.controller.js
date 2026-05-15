const fs = require('fs/promises');
const path = require('path');
const pool = require('../config/db');
const { canViewVehiculo } = require('./access.controller');

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

async function getPagosMes(req, res, next) {
  try {
    const { vehiculoId, year: yearParam, month: monthParam } = req.params;
    const vehiculo_id = Number(vehiculoId);
    const year = Number(yearParam);
    const month = Number(monthParam);
    if (!vehiculo_id || !year || !month) return res.status(400).json({ message: 'Parámetros inválidos' });

    const allowed = await canViewVehiculo({
      userId: req.user.id,
      rol: req.user.rol,
      vehiculoId: vehiculo_id,
    });
    if (!allowed) return res.status(403).json({ message: 'No tienes acceso a este vehículo' });

    const [rows] = await pool.query(
      `SELECT p.*,
        (
          SELECT COUNT(*)
          FROM comentarios_pago c
          WHERE c.pago_id = p.id
        ) AS comentarios_count
      FROM pagos_diarios p
      WHERE p.vehiculo_id = :vehiculo_id
        AND YEAR(p.fecha) = :year
        AND MONTH(p.fecha) = :month
      ORDER BY p.fecha ASC`,
      { vehiculo_id, year, month }
    );
    const normalized = rows.map((r) => ({
      ...r,
      fecha:
        r.fecha instanceof Date
          ? `${r.fecha.getUTCFullYear()}-${String(r.fecha.getUTCMonth() + 1).padStart(2, '0')}-${String(r.fecha.getUTCDate()).padStart(2, '0')}`
          : String(r.fecha).slice(0, 10),
    }));
    return res.json(normalized);
  } catch (err) {
    return next(err);
  }
}

async function crearPago(req, res, next) {
  try {
    const conductorId = req.user.id;
    const { vehiculoId, fecha } = req.body || {};
    if (!vehiculoId || !fecha) return res.status(400).json({ message: 'vehiculoId y fecha son obligatorios' });
    if (!req.file) return res.status(400).json({ message: 'Imagen obligatoria' });

    const vehiculo_id = Number(vehiculoId);
    const allowed = await canViewVehiculo({ userId: conductorId, rol: 'conductor', vehiculoId: vehiculo_id });
    if (!allowed) return res.status(403).json({ message: 'No estás vinculado a este vehículo' });

    const imagen_url = `/static/uploads/${req.file.filename}`;
    try {
      const [result] = await pool.query(
        `INSERT INTO pagos_diarios (conductor_id, vehiculo_id, fecha, imagen_url, estado)
         VALUES (:conductor_id, :vehiculo_id, :fecha, :imagen_url, 'pendiente')`,
        { conductor_id: conductorId, vehiculo_id, fecha, imagen_url }
      );
      return res.status(201).json({
        id: result.insertId,
        conductor_id: conductorId,
        vehiculo_id,
        fecha,
        imagen_url,
        estado: 'pendiente',
      });
    } catch (err) {
      // Duplicate day upload -> remove file
      await fs.unlink(path.join(UPLOADS_DIR, req.file.filename)).catch(() => {});
      if (String(err && err.code) === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Ya existe un pago para ese día' });
      }
      throw err;
    }
  } catch (err) {
    return next(err);
  }
}

async function eliminarPago(req, res, next) {
  try {
    const conductorId = req.user.id;
    const pagoId = Number(req.params.id);
    if (!pagoId) return res.status(400).json({ message: 'id inválido' });

    const [rows] = await pool.query(
      'SELECT id, imagen_url FROM pagos_diarios WHERE id = :id AND conductor_id = :conductor_id',
      { id: pagoId, conductor_id: conductorId }
    );
    if (!rows.length) return res.status(404).json({ message: 'Pago no encontrado' });

    await pool.query('DELETE FROM pagos_diarios WHERE id = :id', { id: pagoId });

    const imagen = rows[0].imagen_url || '';
    const filename = imagen.startsWith('/static/uploads/') ? imagen.replace('/static/uploads/', '') : null;
    if (filename) {
      await fs.unlink(path.join(UPLOADS_DIR, filename)).catch(() => {});
    }
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getPagosMes, crearPago, eliminarPago };

