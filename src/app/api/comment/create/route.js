import { currentUser } from '@clerk/nextjs/server';
import Comment from '../../../../lib/models/comment.model.js';
import Post from '../../../../lib/models/post.model.js';
import User from '../../../../lib/models/user.model.js';
import { connect } from '../../../../lib/mongodb/mongoose.js';

export const POST = async (req) => {
  try {
    const authUser = await currentUser();

    if (!authUser) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connect();
    const data = await req.json();
    const content = data.content?.trim();
    const parentCommentId = data.parentCommentId?.trim() || null;

    if (!data.postId || !content) {
      return Response.json(
        { message: 'postId and content are required' },
        { status: 400 }
      );
    }

    const [mongoUser, post] = await Promise.all([
      User.findOne({ clerkId: authUser.id }).lean(),
      Post.findById(data.postId).lean(),
    ]);

    if (!mongoUser) {
      return Response.json(
        { message: 'User profile not found in database' },
        { status: 404 }
      );
    }

    if (!post) {
      return Response.json({ message: 'Post not found' }, { status: 404 });
    }

    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId).lean();

      if (!parentComment || parentComment.postId !== data.postId) {
        return Response.json(
          { message: 'Parent comment not found' },
          { status: 404 }
        );
      }
    }

    const displayName =
      mongoUser.username ||
      [mongoUser.firstName, mongoUser.lastName].filter(Boolean).join(' ') ||
      authUser.username ||
      'Anonymous';

    const comment = await Comment.create({
      postId: data.postId,
      postTitle: post.title || '',
      postSlug: post.slug || '',
      parentCommentId,
      userId: mongoUser._id.toString(),
      username: displayName,
      profilePicture: mongoUser.profilePicture || authUser.imageUrl || '',
      content,
      isApproved: true,
    });

    return Response.json({ comment }, { status: 201 });
  } catch (error) {
    console.log('Error creating comment:', error);
    return Response.json(
      { message: 'Error creating comment' },
      { status: 500 }
    );
  }
};
