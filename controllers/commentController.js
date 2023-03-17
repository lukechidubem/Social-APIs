const AppError = require('../utils/appError');
const Comment = require('./../models/commentModel');
const catchAsync = require('./../utils/catchAsync');

exports.setPostCommentUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.post) req.body.post = req.params.postId;
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.name) req.body.name = req.user.firstName;
  next();
};

// exports.setPostId = (req, res, next) => {
//   // Allow nested routes
//   if (!req.body.post) req.body.post = req.params.postId;

//   next();
// };

// Function to Create a comment on a product
exports.createComment = catchAsync(async (req, res, next) => {
  const { name, comment, user, post } = req.body;

  const newComment = await Comment.create({ name, comment, user, post });

  res.status(201).json({
    status: 'success',
    data: {
      data: newComment,
    },
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await Comment.findByIdAndDelete(commentId, {
    new: true,
  });

  if (!comment) {
    return next(new AppError('No comment found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
