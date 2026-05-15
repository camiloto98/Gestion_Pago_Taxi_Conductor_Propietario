const express = require('express');
const { authRequired } = require('../middleware/auth');
const auth = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', auth.register);
router.post('/login', auth.login);
router.get('/me', authRequired, auth.me);

module.exports = router;

