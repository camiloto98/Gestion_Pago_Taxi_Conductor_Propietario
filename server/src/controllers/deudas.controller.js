const pool = require('../config/db');
const { canViewVehiculo } = require('./access.controller');

// Convierte montos escritos con formato colombiano a número:
// "300.000" -> 300000, "1.500.000" -> 1500000, "50000" -> 50000
function aNumeroColombiano(valor) {
  if (valor === undefined || valor === null || valor === '') return 0;
  const soloDigitos = String(valor).replace(/\D/g, '');
  return soloDigitos ? Number(soloDigitos) : 0;
}

// El propietario registra una deuda para el conductor de su vehículo
async function crearDeuda(req, res, next) {
  try {
    const propietarioId = req.user.id;
    const { vehiculoId, conductorId, monto, descripcion } = req.body || {};

    const vehiculo_id = Number(vehiculoId);
    const montoNum = aNumeroColombiano(monto);

    if (!vehiculo_id || !montoNum || montoNum <= 0) {
      return res.status(400).json({ message: 'vehiculoId y monto son obligatorios' });
    }

    // Solo el propietario del vehículo puede registrar deudas
    const allowed = await canViewVehiculo({ userId: propietarioId, rol: 'propietario', vehiculoId: vehiculo_id });
    if (!allowed) return res.status(403).json({ message: 'No eres propietario de este vehículo' });

    // Determinar el conductor vinculado: se usa el conductorId enviado o el último token usado del vehículo
    let conductor_id = conductorId ? Number(conductorId) : null;
    if (!conductor_id) {
      const [auto] = await pool.query(
        `SELECT conductor_id FROM tokens_acceso
         WHERE vehiculo_id = :vehiculo_id AND usado = TRUE AND conductor_id IS NOT NULL
         ORDER BY creado_en DESC
         LIMIT 1`,
        { vehiculo_id }
      );
      conductor_id = auto.length ? Number(auto[0].conductor_id) : null;
    }
    if (!conductor_id) {
      return res.status(400).json({ message: 'No hay un conductor vinculado a este vehículo' });
    }

    // Verificar que el conductor está vinculado al vehículo
    const [vinculo] = await pool.query(
      `SELECT id FROM tokens_acceso
       WHERE vehiculo_id = :vehiculo_id AND conductor_id = :conductor_id AND usado = TRUE
       LIMIT 1`,
      { vehiculo_id, conductor_id }
    );
    if (!vinculo.length) {
      return res.status(400).json({ message: 'El conductor no está vinculado a este vehículo' });
    }

    const [result] = await pool.query(
      `INSERT INTO deudas (vehiculo_id, conductor_id, propietario_id, monto, descripcion)
       VALUES (:vehiculo_id, :conductor_id, :propietario_id, :monto, :descripcion)`,
      {
        vehiculo_id,
        conductor_id,
        propietario_id: propietarioId,
        monto: montoNum.toFixed(2),
        descripcion: descripcion || null,
      }
    );

    return res.status(201).json({
      id: result.insertId,
      vehiculo_id,
      conductor_id,
      propietario_id: propietarioId,
      monto: montoNum,
      descripcion: descripcion || null,
      saldo: montoNum,
      total_abonado: 0,
    });
  } catch (err) {
    return next(err);
  }
}

// Lista deudas de un vehículo: propietario o conductor vinculado
async function getDeudasVehiculo(req, res, next) {
  try {
    const vehiculoId = Number(req.params.vehiculoId);
    const { rol, id: userId } = req.user;
    if (!vehiculoId) return res.status(400).json({ message: 'vehiculoId inválido' });

    const allowed = await canViewVehiculo({ userId, rol, vehiculoId });
    if (!allowed) return res.status(403).json({ message: 'No tienes acceso a este vehículo' });

    const [rows] = await pool.query(
      `SELECT d.*,
              u.nombre AS conductor_nombre,
              p.nombre AS propietario_nombre,
              (SELECT COALESCE(SUM(a.monto), 0) FROM abonos_deuda a WHERE a.deuda_id = d.id) AS total_abonado,
              (SELECT COUNT(*) FROM abonos_deuda a WHERE a.deuda_id = d.id) AS abonos_count
       FROM deudas d
       JOIN users u ON u.id = d.conductor_id
       JOIN users p ON p.id = d.propietario_id
       WHERE d.vehiculo_id = :vehiculo_id
       ORDER BY d.creado_en DESC`,
      { vehiculo_id: vehiculoId }
    );

    const normalized = rows.map((r) => ({
      ...r,
      monto: Number(r.monto),
      total_abonado: Number(r.total_abonado),
      saldo: Number(r.monto) - Number(r.total_abonado),
      creado_en:
        r.creado_en instanceof Date
          ? r.creado_en.toISOString()
          : r.creado_en,
    }));

    return res.json(normalized);
  } catch (err) {
    return next(err);
  }
}

// Abonar a una deuda: permite propietario y conductor vinculado
async function abonarDeuda(req, res, next) {
  try {
    const deudaId = Number(req.params.deudaId);
    const { monto, comentario } = req.body || {};
    const montoNum = aNumeroColombiano(monto);

    if (!deudaId) return res.status(400).json({ message: 'deudaId inválido' });
    if (!montoNum || montoNum <= 0) return res.status(400).json({ message: 'Monto de abono inválido' });

    const [deudas] = await pool.query(
      `SELECT d.*, v.propietario_id
       FROM deudas d
       JOIN vehiculos v ON v.id = d.vehiculo_id
       WHERE d.id = :deuda_id`,
      { deuda_id: deudaId }
    );
    if (!deudas.length) return res.status(404).json({ message: 'Deuda no encontrada' });

    const deuda = deudas[0];
    // Permiso: propietario del vehículo o conductor deudor
    const allowed = deuda.propietario_id === req.user.id || deuda.conductor_id === req.user.id;
    if (!allowed) return res.status(403).json({ message: 'No tienes permiso para abonar esta deuda' });

    // Calcular saldo actual
    const [[{ total_abonado }]] = await pool.query(
      'SELECT COALESCE(SUM(monto), 0) AS total_abonado FROM abonos_deuda WHERE deuda_id = :deuda_id',
      { deuda_id: deudaId }
    );
    const saldo = Number(deuda.monto) - Number(total_abonado);
    if (montoNum > saldo) {
      return res.status(400).json({ message: `El abono excede el saldo pendiente ($${saldo.toFixed(2)})` });
    }

    const [result] = await pool.query(
      `INSERT INTO abonos_deuda (deuda_id, usuario_id, monto, comentario)
       VALUES (:deuda_id, :usuario_id, :monto, :comentario)`,
      {
        deuda_id: deudaId,
        usuario_id: req.user.id,
        monto: montoNum.toFixed(2),
        comentario: comentario || null,
      }
    );

    const nuevoSaldo = saldo - montoNum;
    return res.status(201).json({
      id: result.insertId,
      deuda_id: deudaId,
      usuario_id: req.user.id,
      monto: montoNum,
      comentario: comentario || null,
      nuevo_saldo: nuevoSaldo,
    });
  } catch (err) {
    return next(err);
  }
}

// Eliminar una deuda: solo el propietario que la creó
async function eliminarDeuda(req, res, next) {
  try {
    const deudaId = Number(req.params.deudaId);
    if (!deudaId) return res.status(400).json({ message: 'deudaId inválido' });

    const [deudas] = await pool.query(
      `SELECT d.*, v.propietario_id
       FROM deudas d
       JOIN vehiculos v ON v.id = d.vehiculo_id
       WHERE d.id = :deuda_id`,
      { deuda_id: deudaId }
    );
    if (!deudas.length) return res.status(404).json({ message: 'Deuda no encontrada' });

    if (deudas[0].propietario_id !== req.user.id) {
      return res.status(403).json({ message: 'Solo el propietario puede eliminar esta deuda' });
    }

    // ON DELETE CASCADE elimina también los abonos de la deuda
    await pool.query('DELETE FROM deudas WHERE id = :deuda_id', { deuda_id: deudaId });
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

// Historial de abonos de una deuda: propietario o conductor deudor
async function getAbonosDeuda(req, res, next) {
  try {
    const deudaId = Number(req.params.deudaId);
    if (!deudaId) return res.status(400).json({ message: 'deudaId inválido' });

    const [deudas] = await pool.query(
      `SELECT d.*, v.propietario_id
       FROM deudas d
       JOIN vehiculos v ON v.id = d.vehiculo_id
       WHERE d.id = :deuda_id`,
      { deuda_id: deudaId }
    );
    if (!deudas.length) return res.status(404).json({ message: 'Deuda no encontrada' });

    const deuda = deudas[0];
    const allowed = deuda.propietario_id === req.user.id || deuda.conductor_id === req.user.id;
    if (!allowed) return res.status(403).json({ message: 'Sin acceso' });

    const [rows] = await pool.query(
      `SELECT a.id, a.deuda_id, a.usuario_id, a.monto, a.comentario, a.creado_en,
              u.nombre AS usuario_nombre, u.rol AS usuario_rol
       FROM abonos_deuda a
       JOIN users u ON u.id = a.usuario_id
       WHERE a.deuda_id = :deuda_id
       ORDER BY a.creado_en DESC`,
      { deuda_id: deudaId }
    );

    const normalized = rows.map((r) => ({
      ...r,
      monto: Number(r.monto),
    }));

    return res.json(normalized);
  } catch (err) {
    return next(err);
  }
}

module.exports = { crearDeuda, getDeudasVehiculo, abonarDeuda, getAbonosDeuda, eliminarDeuda };
