const pool = require('../config/db');

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = () =>
    Array.from({ length: 4 })
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join('');
  return `TXI-${part()}`;
}

async function generar(req, res, next) {
  try {
    const propietarioId = req.user.id;
    const { vehiculoId } = req.body || {};
    if (!vehiculoId) return res.status(400).json({ message: 'vehiculoId es obligatorio' });

    const [veh] = await pool.query(
      'SELECT id FROM vehiculos WHERE id = :id AND propietario_id = :propietario_id',
      { id: vehiculoId, propietario_id: propietarioId }
    );
    if (!veh.length) return res.status(404).json({ message: 'Vehículo no encontrado' });

    let codigo = null;
    for (let i = 0; i < 5; i += 1) {
      const attempt = generateCode();
      const [exists] = await pool.query('SELECT id FROM tokens_acceso WHERE codigo = :codigo', { codigo: attempt });
      if (!exists.length) {
        codigo = attempt;
        break;
      }
    }
    if (!codigo) return res.status(500).json({ message: 'No se pudo generar el token' });

    const [result] = await pool.query(
      `INSERT INTO tokens_acceso (vehiculo_id, propietario_id, codigo, usado)
       VALUES (:vehiculo_id, :propietario_id, :codigo, FALSE)`,
      { vehiculo_id: vehiculoId, propietario_id: propietarioId, codigo }
    );

    return res.status(201).json({ id: result.insertId, codigo, vehiculo_id: vehiculoId, usado: false });
  } catch (err) {
    return next(err);
  }
}

async function unirse(req, res, next) {
  try {
    const conductorId = req.user.id;
    const { codigo } = req.body || {};
    if (!codigo) return res.status(400).json({ message: 'codigo es obligatorio' });

    const [rows] = await pool.query(
      `SELECT t.id, t.usado, t.vehiculo_id
       FROM tokens_acceso t
       WHERE t.codigo = :codigo
       LIMIT 1`,
      { codigo }
    );
    if (!rows.length) return res.status(404).json({ message: 'Código no válido' });
    const token = rows[0];
    if (token.usado) return res.status(409).json({ message: 'Este código ya fue usado' });

    await pool.query(
      `UPDATE tokens_acceso
       SET usado = TRUE, conductor_id = :conductor_id
       WHERE id = :id AND usado = FALSE`,
      { conductor_id: conductorId, id: token.id }
    );

    return res.json({ ok: true, vehiculoId: token.vehiculo_id });
  } catch (err) {
    return next(err);
  }
}

module.exports = { generar, unirse };

