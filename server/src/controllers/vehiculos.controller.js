const pool = require('../config/db');

async function createVehiculo(req, res, next) {
  try {
    const propietarioId = req.user.id;
    const { placa, marca, modelo, año, color, foto_url } = req.body || {};
    if (!placa) return res.status(400).json({ message: 'La placa es obligatoria' });

    const [existing] = await pool.query('SELECT id FROM vehiculos WHERE placa = :placa', { placa });
    if (existing.length) return res.status(409).json({ message: 'Ya existe un vehículo con esa placa' });

    const [result] = await pool.query(
      `INSERT INTO vehiculos (propietario_id, placa, marca, modelo, año, color, foto_url)
       VALUES (:propietario_id, :placa, :marca, :modelo, :anio, :color, :foto_url)`,
      {
        propietario_id: propietarioId,
        placa,
        marca: marca || null,
        modelo: modelo || null,
        anio: año || null,
        color: color || null,
        foto_url: foto_url || null,
      }
    );

    return res.status(201).json({
      id: result.insertId,
      propietario_id: propietarioId,
      placa,
      marca: marca || null,
      modelo: modelo || null,
      año: año || null,
      color: color || null,
      foto_url: foto_url || null,
    });
  } catch (err) {
    return next(err);
  }
}

async function misVehiculos(req, res, next) {
  try {
    const propietarioId = req.user.id;
    const [rows] = await pool.query(
      `SELECT v.*,
        (
          SELECT u.nombre
          FROM tokens_acceso t
          JOIN users u ON u.id = t.conductor_id
          WHERE t.vehiculo_id = v.id AND t.usado = TRUE AND t.conductor_id IS NOT NULL
          ORDER BY t.creado_en DESC
          LIMIT 1
        ) AS conductor_nombre
      FROM vehiculos v
      WHERE v.propietario_id = :propietario_id
      ORDER BY v.creado_en DESC`,
      { propietario_id: propietarioId }
    );
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
}

async function vinculados(req, res, next) {
  try {
    const conductorId = req.user.id;
    const [rows] = await pool.query(
      `SELECT v.*, u.nombre AS propietario_nombre, u.id AS propietario_id
       FROM tokens_acceso t
       JOIN vehiculos v ON v.id = t.vehiculo_id
       JOIN users u ON u.id = v.propietario_id
       WHERE t.usado = TRUE AND t.conductor_id = :conductor_id
       ORDER BY t.creado_en DESC`,
      { conductor_id: conductorId }
    );
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
}

module.exports = { createVehiculo, misVehiculos, vinculados };

