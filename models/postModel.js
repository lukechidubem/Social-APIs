const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      trim: true,
      required: [true, 'A Product must have a description'],
    },

    post_image: [String],

    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Post must belong to a user'],
    },

    viewedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    likes: {
      type: Map,
      typeof: Boolean,
      default: [],
    },

    location: String,
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate
postSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'post',
  localField: '_id',
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
