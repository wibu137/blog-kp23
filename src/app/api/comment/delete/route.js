import { currentUser } from '@clerk/nextjs/server';
import Comment from '../../../../lib/models/comment.model.js';
import User from '../../../../lib/models/user.model.js';
import { connect } from '../../../../lib/mongodb/mongoose.js';

async function collectDescendantIds(rootId) {
  const ids = [rootId];
  const queue = [rootId];

  while (queue.length > 0) {
    const currentId = queue.shift();
    const children = await Comment.find(
      { parentCommentId: currentId },
      { _id: 1 }
    ).lean();

    const childIds = children.map((item) => item._id.toString());
    ids.push(...childIds);
    queue.push(...childIds);
  }

  return ids;
}

export const DELETE = async (req) => {
  try {
    const authUser = await currentUser();

    if (!authUser) {
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

    const [comment, mongoUser] = await Promise.all([
      Comment.findById(data.commentId).lean(),
      User.findOne({ clerkId: authUser.id }).lean(),
    ]);

    if (!comment) {
      return Response.json({ message: 'Comment not found' }, { status: 404 });
    }

    const viewerMongoId = mongoUser?._id?.toString();
    const isAdmin = Boolean(authUser.publicMetadata?.isAdmin);
    const isOwner = viewerMongoId && comment.userId === viewerMongoId;

    if (!isAdmin && !isOwner) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const idsToDelete = await collectDescendantIds(data.commentId);

    await Comment.deleteMany({
      _id: { $in: idsToDelete },
    });

    return Response.json(
      { deletedIds: idsToDelete, rootCommentId: data.commentId },
      { status: 200 }
    );
  } catch (error) {
    console.log('Error deleting comment:', error);
    return Response.json(
      { message: 'Error deleting comment' },
      { status: 500 }
    );
  }
};
