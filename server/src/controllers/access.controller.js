const pool = require('../config/db');

async function canViewVehiculo({ userId, rol, vehiculoId }) {
  if (rol === 'propietario') {
    const [rows] = await pool.query(
      'SELECT id FROM vehiculos WHERE id = :id AND propietario_id = :propietario_id',
      { id: vehiculoId, propietario_id: userId }
    );
    return rows.length > 0;
  }
  if (rol === 'conductor') {
    const [rows] = await pool.query(
      `SELECT id FROM tokens_acceso
       WHERE vehiculo_id = :vehiculo_id AND usado = TRUE AND conductor_id = :conductor_id
       LIMIT 1`,
      { vehiculo_id: vehiculoId, conductor_id: userId }
    );
    return rows.length > 0;
  }
  return false;
}

module.exports = { canViewVehiculo };

