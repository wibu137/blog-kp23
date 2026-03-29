import { currentUser } from '@clerk/nextjs/server';
import Comment from '../../../../lib/models/comment.model.js';
import { connect } from '../../../../lib/mongodb/mongoose.js';

export const POST = async (req) => {
  try {
    await connect();
    const data = await req.json();
    const authUser = await currentUser();
    const isAdmin = Boolean(authUser?.publicMetadata?.isAdmin);

    if (!data.postId && !isAdmin) {
      return Response.json(
        { message: 'postId is required for non-admin requests' },
        { status: 400 }
      );
    }

    const query = data.postId ? { postId: data.postId } : {};
    const comments = await Comment.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return Response.json(
      {
        comments,
        viewer: {
          isAdmin,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.log('Error getting comments:', error);
    return Response.json(
      { message: 'Error getting comments' },
      { status: 500 }
    );
  }
};
