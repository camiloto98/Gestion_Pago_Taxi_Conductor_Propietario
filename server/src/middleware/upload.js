const path = require('path');
const multer = require('multer');

const maxSize = 5 * 1024 * 1024; // 5MB

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ext === '.png' || ext === '.jpg' || ext === '.jpeg' ? ext : '';
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, name);
  },
});

function fileFilter(req, file, cb) {
  const ok = file.mimetype === 'image/jpeg' || file.mimetype === 'image/png';
  if (!ok) return cb(new Error('Solo se permiten imágenes JPG o PNG'));
  return cb(null, true);
}

const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSize },
});

module.exports = { uploadImage };

