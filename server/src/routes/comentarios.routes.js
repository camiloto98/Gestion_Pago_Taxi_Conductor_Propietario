const express = require('express');
const { authRequired, requireRole } = require('../middleware/auth');
const comentarios = require('../controllers/comentarios.controller');

const router = express.Router();

router.post('/', authRequired, requireRole('propietario'), comentarios.createComentarioPago);
router.get('/:pagoId', authRequired, comentarios.getComentariosPago);

module.exports = router;

