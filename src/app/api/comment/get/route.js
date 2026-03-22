import Comment from '../../../../lib/models/comment.model.js';
import { connect } from '../../../../lib/mongodb/mongoose.js';

export const POST = async (req) => {
  try {
    await connect();
    const data = await req.json();

    if (!data.postId) {
      return Response.json(
        { message: 'postId is required' },
        { status: 400 }
      );
    }

    const comments = await Comment.find({ postId: data.postId })
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({ comments }, { status: 200 });
  } catch (error) {
    console.log('Error getting comments:', error);
    return Response.json(
      { message: 'Error getting comments' },
      { status: 500 }
    );
  }
};
