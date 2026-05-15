const express = require('express');
const { authRequired, requireRole } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');
const pagos = require('../controllers/pagos.controller');

const router = express.Router();

router.get('/:vehiculoId/:year/:month', authRequired, pagos.getPagosMes);
router.post('/', authRequired, requireRole('conductor'), uploadImage.single('imagen'), pagos.crearPago);
router.delete('/:id', authRequired, requireRole('conductor'), pagos.eliminarPago);

module.exports = router;

