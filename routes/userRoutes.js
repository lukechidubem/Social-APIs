const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router.get('/me', userController.getCurrentUser);
router.patch(
  '/updateProfile',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateUser
);
router.delete('/deleteMe', userController.deleteMe);
router.get('/:userId', userController.getOtherUser);

router.get('/page/:userId', userController.getUserPage);
router.get('/friends/:userId', userController.getUserFriends);
router.patch('/:userId/:friendId', userController.addRemoveFriend);

module.exports = router;
