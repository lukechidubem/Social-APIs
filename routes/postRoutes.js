const express = require('express');
const postController = require('../controllers/postController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(postController.getFeedPosts)
  .post(
    postController.uploadPostImage,
    postController.resizePostImage,
    postController.setPostUserIds,
    postController.createPost
  );

router
  .route('/:postId')
  .get(postController.getPost)
  .patch(
    postController.uploadPostImage,
    postController.resizePostImage,
    postController.updatePost
  )
  .delete(postController.deletePost);

router.route('/like/:postId').patch(postController.likePost);

module.exports = router;
