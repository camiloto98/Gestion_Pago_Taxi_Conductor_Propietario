const express = require('express');
const { authRequired, requireRole } = require('../middleware/auth');
const vehiculos = require('../controllers/vehiculos.controller');

const router = express.Router();

router.post('/', authRequired, requireRole('propietario'), vehiculos.createVehiculo);
router.get('/mis-vehiculos', authRequired, requireRole('propietario'), vehiculos.misVehiculos);
router.get('/vinculados', authRequired, requireRole('conductor'), vehiculos.vinculados);

module.exports = router;

