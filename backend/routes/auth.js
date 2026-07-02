const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/:uid', authController.getUser);
router.post('/:uid/device-bind', authController.bindDevice);

module.exports = router;
