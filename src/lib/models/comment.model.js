import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: String,
      required: true,
      index: true,
    },
    postTitle: {
      type: String,
      default: '',
      trim: true,
    },
    postSlug: {
      type: String,
      default: '',
      trim: true,
    },
    parentCommentId: {
      type: String,
      default: null,
      index: true,
    },
    userId: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    profilePicture: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    isApproved: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ parentCommentId: 1, createdAt: 1 });

const Comment =
  mongoose.models.Comment || mongoose.model('Comment', commentSchema);

export default Comment;
