import { currentUser } from '@clerk/nextjs/server';
import Comment from '../../../../lib/models/comment.model.js';
import { connect } from '../../../../lib/mongodb/mongoose.js';

export const PATCH = async (req) => {
  try {
    const authUser = await currentUser();

    if (!authUser?.publicMetadata?.isAdmin) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connect();
    const data = await req.json();

    if (!data.commentId) {
      return Response.json(
        { message: 'commentId is required' },
        { status: 400 }
      );
    }

    const comment = await Comment.findByIdAndUpdate(
      data.commentId,
      { isApproved: true },
      { new: true }
    ).lean();

    if (!comment) {
      return Response.json({ message: 'Comment not found' }, { status: 404 });
    }

    return Response.json({ comment }, { status: 200 });
  } catch (error) {
    console.log('Error approving comment:', error);
    return Response.json(
      { message: 'Error approving comment' },
      { status: 500 }
    );
  }
};
