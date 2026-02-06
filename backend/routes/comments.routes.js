const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const auth = require('../middleware/auth.middleware');

router.post('/', auth, commentController.addComment);
router.get('/task/:taskId', auth, commentController.getTaskComments);

module.exports = router;
