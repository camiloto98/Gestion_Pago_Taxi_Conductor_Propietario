const express = require('express');
const { authRequired, requireRole } = require('../middleware/auth');
const deudas = require('../controllers/deudas.controller');

const router = express.Router();

// Ver deudas de un vehículo: propietario o conductor vinculado
router.get('/vehiculo/:vehiculoId', authRequired, deudas.getDeudasVehiculo);

// Crear deuda: solo propietario
router.post('/', authRequired, requireRole('propietario'), deudas.crearDeuda);

// Ver historial de abonos de una deuda
router.get('/:deudaId/abonos', authRequired, deudas.getAbonosDeuda);

// Abonar a una deuda: propietario y conductor
router.post('/:deudaId/abonar', authRequired, deudas.abonarDeuda);

// Eliminar una deuda: solo propietario
router.delete('/:deudaId', authRequired, requireRole('propietario'), deudas.eliminarDeuda);

module.exports = router;