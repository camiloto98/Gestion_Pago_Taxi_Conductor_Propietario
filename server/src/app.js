const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const UPLOADS_DIR = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const authRoutes = require('./routes/auth.routes');
const vehiculosRoutes = require('./routes/vehiculos.routes');
const tokensRoutes = require('./routes/tokens.routes');
const pagosRoutes = require('./routes/pagos.routes');
const comentariosRoutes = require('./routes/comentarios.routes');
const feedRoutes = require('./routes/feed.routes');

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
  try {
    const conn = await pool.getConnection();
    conn.release();
    // eslint-disable-next-line no-console
    console.log(`${GREEN}✔ Base de datos conectada correctamente${RESET}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`${RED}✘ Error al conectar con la base de datos: ${err.message}${RESET}`);
  }
});

