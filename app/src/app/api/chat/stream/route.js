import { getAssistantSession } from '../../../../lib/chat/auth';
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
    const body = await req.json();
    const { clerkId, role, dbUser, isGuest } = await getAssistantSession();
    const content = normalizeWhitespace(body?.message || '');
    const guestMessages = Array.isArray(body?.messages)
      ? body.messages
          .filter(
            (message) =>
              message &&
              ['user', 'assistant'].includes(message.role) &&
              typeof message.content === 'string'
          )
          .map((message) => ({
            role: message.role,
            content: normalizeWhitespace(message.content),
            citations: Array.isArray(message.citations) ? message.citations : [],
            createdAt: message.createdAt ? new Date(message.createdAt) : new Date(),
          }))
          .filter((message) => message.content)
      : [];

    if (!content) {
      return jsonError('Message is required', 400);
    }

    let conversation = null;
    let shortTermMemory = '';
    let longTermMemory = '';

    if (!isGuest) {
      conversation = body?.conversationId
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
      shortTermMemory = conversation.memory.shortTerm;
      longTermMemory = conversation.memory.longTerm;
    } else {
      shortTermMemory = buildShortTermMemory([
        ...guestMessages,
        {
          role: 'user',
          content,
          citations: [],
          createdAt: new Date(),
        },
      ]);
    }

    const retrievedDocuments = await retrieveKnowledge(content, role);
    const citations = retrievedDocuments.map((doc) => ({
      title: doc.title,
      source: doc.source,
      excerpt: doc.excerpt,
      score: doc.score,
    }));
    const promptMessages = buildPromptMessages({
      question: content,
      shortTermMemory,
      longTermMemory,
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
              if (conversation) {
                conversation.messages.push({
                  role: 'assistant',
                  content: output,
                  citations,
                  createdAt: new Date(),
                });

                conversation.memory.shortTerm = buildShortTermMemory(
                  conversation.messages
                );
                conversation.lastMessageAt = new Date();
                await conversation.save();
              }
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
        'X-Assistant-Mode': isGuest ? 'guest' : 'account',
        ...(conversation ? { 'X-Conversation-Id': conversation._id.toString() } : {}),
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
