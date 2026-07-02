const express = require('express');
const router = express.Router();
const materialsController = require('../controllers/materialsController');

router.post('/log', materialsController.log);
router.get('/report', materialsController.report);

module.exports = router;
