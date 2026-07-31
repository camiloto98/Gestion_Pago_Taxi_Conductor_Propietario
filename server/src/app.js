const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const UPLOADS_DIR = process.env.UPLOAD_PATH
  ? path.resolve(process.env.UPLOAD_PATH)
  : path.resolve(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const authRoutes = require('./routes/auth.routes');
const vehiculosRoutes = require('./routes/vehiculos.routes');
const tokensRoutes = require('./routes/tokens.routes');
const pagosRoutes = require('./routes/pagos.routes');
const comentariosRoutes = require('./routes/comentarios.routes');
const deudasRoutes = require('./routes/deudas.routes');
const feedRoutes = require('./routes/feed.routes');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
].filter(Boolean);

if (process.env.VERCEL_URL) {
  allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
}

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin
        || allowedOrigins.includes(origin)
        || /\.vercel\.app$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.use('/static/uploads', express.static(UPLOADS_DIR));

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/vehiculos', vehiculosRoutes);
app.use('/api/tokens', tokensRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/comentarios', comentariosRoutes);
app.use('/api/deudas', deudasRoutes);
app.use('/api/feed', feedRoutes);

// Multer / custom errors
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err && err.message) {
    return res.status(400).json({ message: err.message });
  }
  return res.status(500).json({ message: 'Error interno' });
});

const pool = require('./config/db');

const GREEN = '\x1b[32m';
const RED   = '\x1b[31m';
const RESET = '\x1b[0m';

module.exports = app;

async function logDbStatus() {
  try {
    const conn = await pool.getConnection();
    conn.release();
    // eslint-disable-next-line no-console
    console.log(`${GREEN}✔ Base de datos conectada correctamente${RESET}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`${RED}✘ Error al conectar con la base de datos: ${err.message}${RESET}`);
  }
}

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, async () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on http://localhost:${PORT}`);
    await logDbStatus();
  });
}

