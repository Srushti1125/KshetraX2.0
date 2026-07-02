const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const upload = require('../middleware/upload');

router.post('/check-in', upload.single('selfie'), attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.post('/ping', attendanceController.ping);
router.get('/active', attendanceController.getActive);
router.get('/all', attendanceController.getAll);

module.exports = router;
