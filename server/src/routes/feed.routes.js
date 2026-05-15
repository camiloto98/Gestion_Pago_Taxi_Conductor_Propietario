const express = require('express');
const { authRequired } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');
const feed = require('../controllers/feed.controller');

const router = express.Router();

router.get('/', authRequired, feed.listFeed);
router.post('/', authRequired, uploadImage.single('imagen'), feed.createPost);
router.post('/:id/like', authRequired, feed.likePost);
router.post('/:id/comentar', authRequired, feed.comentar);
router.get('/:id/comentarios', authRequired, feed.listComentarios);

module.exports = router;

