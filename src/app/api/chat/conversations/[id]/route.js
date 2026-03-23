import { requireAssistantUser } from '../../../../../lib/chat/auth';
import { serializeConversation } from '../../../../../lib/chat/utils';
import Conversation from '../../../../../lib/models/conversation.model';

export const dynamic = 'force-dynamic';

export async function GET(_, { params }) {
  try {
    const { clerkId } = await requireAssistantUser();
    const conversation = await Conversation.findOne({
      _id: params.id,
      clerkId,
    });

    if (!conversation) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return Response.json({ conversation: serializeConversation(conversation) });
  } catch (error) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : 500;
    return Response.json(
      { error: status === 401 ? 'Unauthorized' : 'Failed to load conversation' },
      { status }
    );
  }
}
