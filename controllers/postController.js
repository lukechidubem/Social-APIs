const multer = require('multer');
const sharp = require('sharp');
const Post = require('./../models/postModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const filterObject = require('../utils/filterObject');
const Comment = require('../models/commentModel');

// For Image upload
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPostImage = upload.fields([{ name: 'post_image', maxCount: 5 }]);

// Function to resize the post image
exports.resizePostImage = catchAsync(async (req, res, next) => {
  if (!req.files.post_image) return next();

  // req.body.post_image = `post-${req.user.id}-${Date.now()}-post.jpeg`;
  // await sharp(req.files.post_image[0].buffer)
  //   .resize(1200, 1500)
  //   .toFormat('jpeg')
  //   .jpeg({ quality: 90 })
  //   .toFile(`public/img/posts/${req.body.post_image}`);

  req.body.post_image = [];

  await Promise.all(
    req.files.post_image.map(async (file, i) => {
      const filename = `post-${req.user.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(1000, 1200)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/posts/${filename}`);

      req.body.post_image.push(filename);
    })
  );

  next();
});

exports.setPostUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// Function to Create a post
exports.createPost = catchAsync(async (req, res, next) => {
  //  Filtered out unwanted fields names that are not allowed to be updated when creating a new post
  const filteredBody = filterObject(
    req.body,
    'description',
    'post_image',
    'user'
  );
  const post = await Post.create(filteredBody);

  res.status(201).json({
    status: 'success',
    data: {
      data: post,
    },
  });
});

// Function to get a post
exports.getPost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);
  const comments = await Comment.find({ postId });

  if (!post) {
    return next(new AppError('There is no post with such ID.', 400));
  }

  // Get the id of viewers to prevent multiple view count from a user when they view a post multiple times
  //   const views = post.post_views_list.filter((id) => req.user.id === id);

  //   if (views.length < 1 && req.user.id != post.user) {
  //     // Do the follwing of if it is the user's first view and viewer is not post owner
  //     post.post_views += 1;
  //     post.post_views_list.push(req.user.id);
  //   }

  // Save all changes to the database
  //   await post.save();

  await post.updateOne({
    $addToSet: { viewedBy: req.user.id },
    new: true,
  });

  // Getting the views count
  console.log('Total views:', post.viewedBy.length);

  res.status(201).json({
    status: 'success',
    data: {
      post,
      comments,
    },
  });
});

exports.getFeedPosts = catchAsync(async (req, res) => {
  const posts = await Post.find();

  res.status(200).json({
    status: 'success',
    data: {
      posts,
    },
  });
});

// Function to Update post
exports.updatePost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;

  //  Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObject(req.body, 'description', 'post_image');

  //  Update post
  const updatedpost = await Post.findByIdAndUpdate(postId, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      post: updatedpost,
    },
  });
});

// Function to delete a post
exports.deletePost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const post = await Post.findByIdAndDelete(postId, {
    new: true,
  });

  if (!post) {
    return next(
      new AppError(
        'No Post found with that ID, maybe post has been deleted already or does not exist',
        404
      )
    );
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.likePost = catchAsync(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;
  const post = await Post.findById(postId);

  if (!post) {
    return next(
      new AppError('No Post found, maybe post has been deleted', 404)
    );
  }

  const isLiked = post.likes.get(userId);

  if (isLiked) {
    post.likes.delete(userId);
  } else {
    post.likes.set(userId, true);
  }

  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    { likes: post.likes },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      post: updatedPost,
    },
  });
});
