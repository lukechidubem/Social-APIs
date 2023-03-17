const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const filterObject = require('../utils/filterObject');
const Post = require('../models/postModel');

// For Profile image upload
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

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

// Function to get the current user
exports.getCurrentUser = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: user,
    },
  });
});

// Function to get other users
exports.getOtherUser = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const user = await User.findById(userId);
  //   const user = await query;

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: user,
    },
  });
});

// Function to update user data
exports.updateUser = catchAsync(async (req, res, next) => {
  // Create error if user POSTs password data
  if (req.body.password || req.body.confirm_password) {
    return next(new AppError('This route is not for password updates.', 400));
  }

  //  Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObject(
    req.body,
    'firstName',
    'lastName',
    'email',
    'phone',
    'bio',
    'location',
    'occupation',
    'photo'
  );

  if (req.file) filteredBody.photo = req.file.filename;

  //  Update user data
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// Function to get user's page and product
exports.getUserPage = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  const allPosts = await Post.find();

  const userPosts = await allPosts.filter((post) => post.user == userId);

  if (!user) {
    return next(new AppError('There is no user with such ID.', 400));
  }

  //   if (req.user.id != user._id) user.page_views += 1;

  //   await user.save();

  res.status(201).json({
    status: 'success',
    data: {
      user_data: user,
      user_posts: userPosts,
    },
  });
});

exports.getUserFriends = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);

  const friends = await Promise.all(
    user.friends.map((id) => User.findById(id))
  );
  const formattedFriends = friends.map(
    ({ _id, firstName, lastName, occupation, location, photo }) => {
      return { _id, firstName, lastName, occupation, location, photo };
    }
  );

  // res.status(200).json(formattedFriends);

  res.status(201).json({
    status: 'success',
    data: {
      friends: formattedFriends,
    },
  });
});

/* UPDATE */
exports.addRemoveFriend = catchAsync(async (req, res) => {
  const { userId, friendId } = req.params;
  const user = await User.findById(userId);
  const friend = await User.findById(friendId);

  if (user.friends.includes(friendId)) {
    user.friends = user.friends.filter((id) => id !== friendId);
    friend.friends = friend.friends.filter((id) => id !== userId);
  } else {
    user.friends.push(friendId);
    friend.friends.push(userId);
  }

  await user.save();
  await friend.save();

  const friends = await Promise.all(
    user.friends.map((id) => User.findById(id))
  );
  const formattedFriends = friends.map(
    (_id, firstName, lastName, occupation, location, photo) => {
      return { _id, firstName, lastName, occupation, location, photo };
    }
  );

  // res.status(200).json(formattedFriends);

  res.status(201).json({
    status: 'success',
    data: {
      friends: formattedFriends,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
