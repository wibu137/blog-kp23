import { requireAssistantUser } from '../../../../lib/chat/auth';
import {
  buildLongTermMemory,
  buildShortTermMemory,
} from '../../../../lib/chat/memory';
import { streamChatCompletion } from '../../../../lib/chat/openai';
import { buildPromptMessages } from '../../../../lib/chat/prompt';
import { retrieveKnowledge } from '../../../../lib/chat/retrieval';
import {
  createConversationTitle,
  normalizeWhitespace,
} from '../../../../lib/chat/utils';
import Conversation from '../../../../lib/models/conversation.model';

export const dynamic = 'force-dynamic';

function jsonError(message, status) {
  return Response.json({ error: message }, { status });
}

export async function POST(req) {
  try {
    const { clerkId, role, dbUser } = await requireAssistantUser();
    const body = await req.json();
    const content = normalizeWhitespace(body?.message || '');

    if (!content) {
      return jsonError('Message is required', 400);
    }

    let conversation = body?.conversationId
      ? await Conversation.findOne({ _id: body.conversationId, clerkId })
      : null;

    if (!conversation) {
      conversation = await Conversation.create({
        clerkId,
        title: createConversationTitle(content),
        memory: {
          shortTerm: '',
          longTerm: buildLongTermMemory(dbUser),
        },
        lastMessageAt: new Date(),
      });
    }

    conversation.messages.push({
      role: 'user',
      content,
      citations: [],
      createdAt: new Date(),
    });

    conversation.memory.longTerm = buildLongTermMemory(dbUser);
    conversation.memory.shortTerm = buildShortTermMemory(conversation.messages);
    conversation.lastMessageAt = new Date();

    if (!conversation.title || conversation.title === 'Cuoc tro chuyen moi') {
      conversation.title = createConversationTitle(content);
    }

    await conversation.save();

    const retrievedDocuments = await retrieveKnowledge(content, role);
    const promptMessages = buildPromptMessages({
      question: content,
      shortTermMemory: conversation.memory.shortTerm,
      longTermMemory: conversation.memory.longTerm,
      documents: retrievedDocuments,
      role,
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          await streamChatCompletion({
            messages: promptMessages,
            onToken(token) {
              controller.enqueue(encoder.encode(token));
            },
            async onComplete(output) {
              conversation.messages.push({
                role: 'assistant',
                content: output,
                citations: retrievedDocuments.map((doc) => ({
                  title: doc.title,
                  source: doc.source,
                  excerpt: doc.excerpt,
                  score: doc.score,
                })),
                createdAt: new Date(),
              });

              conversation.memory.shortTerm = buildShortTermMemory(
                conversation.messages
              );
              conversation.lastMessageAt = new Date();
              await conversation.save();
            },
          });

          controller.close();
        } catch (error) {
          console.error('Chat streaming failed:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Conversation-Id': conversation._id.toString(),
      },
    });
  } catch (error) {
    console.error('Chat route failed:', error);

    if (error.message === 'UNAUTHORIZED') {
      return jsonError('Unauthorized', 401);
    }

    return jsonError('Failed to stream assistant response', 500);
  }
}
