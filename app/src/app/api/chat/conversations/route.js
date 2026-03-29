import { requireAssistantUser } from '../../../../lib/chat/auth';
import { buildLongTermMemory } from '../../../../lib/chat/memory';
import {
  createConversationTitle,
  serializeConversation,
} from '../../../../lib/chat/utils';
import Conversation from '../../../../lib/models/conversation.model';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { clerkId } = await requireAssistantUser();
    const conversations = await Conversation.find({ clerkId })
      .sort({ lastMessageAt: -1 })
      .limit(20);

    return Response.json({
      conversations: conversations.map((conversation) => ({
        id: conversation._id.toString(),
        title: conversation.title,
        lastMessageAt: conversation.lastMessageAt,
        preview:
          conversation.messages[conversation.messages.length - 1]?.content || '',
      })),
    });
  } catch (error) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : 500;
    return Response.json(
      { error: status === 401 ? 'Unauthorized' : 'Failed to load conversations' },
      { status }
    );
  }
}

export async function POST(req) {
  try {
    const { clerkId, dbUser } = await requireAssistantUser();
    const body = await req.json().catch(() => ({}));
    const firstMessage = body?.message || '';

    const conversation = await Conversation.create({
      clerkId,
      title: createConversationTitle(firstMessage),
      memory: {
        shortTerm: '',
        longTerm: buildLongTermMemory(dbUser),
      },
      lastMessageAt: new Date(),
    });

    return Response.json({ conversation: serializeConversation(conversation) });
  } catch (error) {
    const status = error.message === 'UNAUTHORIZED' ? 401 : 500;
    return Response.json(
      { error: status === 401 ? 'Unauthorized' : 'Failed to create conversation' },
      { status }
    );
  }
}
