const express = require('express');
const router = express.Router();
const voiceController = require('../controllers/voiceController');
const upload = require('../middleware/upload');

router.post('/upload', upload.single('audio'), voiceController.upload);
router.get('/list', voiceController.list);
router.post('/:id/response', voiceController.respond);

module.exports = router;
