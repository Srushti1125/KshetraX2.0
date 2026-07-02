const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');

router.get('/', tasksController.getAll);
router.post('/:id/complete', tasksController.complete);

module.exports = router;
