const express = require('express');

const authController = require('../controllers/authController');

const router = express.Router();

// router.post('/signup', authController.signup);
router.post('/signup', authController.register, authController.sendOTP);
router.post('/sendOTP', authController.sendOTP);
router.post('/verifyOTP', authController.verifyOTP);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

module.exports = router;
