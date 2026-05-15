const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

async function register(req, res, next) {
  try {
    const { nombre, email, password, rol, telefono, avatar_url } = req.body || {};
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ message: 'Datos incompletos' });
    }
    if (!['conductor', 'propietario'].includes(rol)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = :email', { email });
    if (existing.length) return res.status(409).json({ message: 'Email ya registrado' });

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (nombre, email, password_hash, rol, telefono, avatar_url)
       VALUES (:nombre, :email, :password_hash, :rol, :telefono, :avatar_url)`,
      { nombre, email, password_hash, rol, telefono: telefono || null, avatar_url: avatar_url || null }
    );

    const user = { id: result.insertId, nombre, email, rol, telefono: telefono || null, avatar_url: avatar_url || null };
    const token = signToken(user);
    return res.status(201).json({ token, user });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Datos incompletos' });

    const [rows] = await pool.query(
      'SELECT id, nombre, email, password_hash, rol, avatar_url, telefono FROM users WHERE email = :email',
      { email }
    );
    if (!rows.length) return res.status(401).json({ message: 'Credenciales inválidas' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });

    const token = signToken(user);
    return res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        avatar_url: user.avatar_url,
        telefono: user.telefono,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function me(req, res, next) {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      'SELECT id, nombre, email, rol, avatar_url, telefono, creado_en FROM users WHERE id = :id',
      { id: userId }
    );
    if (!rows.length) return res.status(404).json({ message: 'Usuario no encontrado' });
    return res.json(rows[0]);
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login, me };

