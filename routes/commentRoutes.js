const express = require('express');

const authController = require('./../controllers/authController');
const commentController = require('../controllers/commentController');
const router = express.Router();

router.use(authController.protect);

router
  .route('/:postId')
  .post(
    commentController.setPostCommentUserIds,
    commentController.createComment
  );

router.delete('/:commentId', commentController.deleteComment);

module.exports = router;
