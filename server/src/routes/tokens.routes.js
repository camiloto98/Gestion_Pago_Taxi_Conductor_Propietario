const express = require('express');
const { authRequired, requireRole } = require('../middleware/auth');
const tokens = require('../controllers/tokens.controller');

const router = express.Router();

router.post('/generar', authRequired, requireRole('propietario'), tokens.generar);
router.post('/unirse', authRequired, requireRole('conductor'), tokens.unirse);

module.exports = router;

