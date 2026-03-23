export function normalizeWhitespace(value = '') {
  return value.replace(/\s+/g, ' ').trim();
}

export function truncateWords(value = '', maxWords = 100) {
  const normalized = normalizeWhitespace(value);
  if (!normalized) {
    return '';
  }

  const words = normalized.split(' ');
  if (words.length <= maxWords) {
    return normalized;
  }

  return words.slice(0, maxWords).join(' ');
}

export function stripHtml(value = '') {
  return normalizeWhitespace(value.replace(/<[^>]*>/g, ' '));
}

export function buildTranscript(messages = [], maxWords = 100) {
  const selected = [];
  let totalWords = 0;

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    const line = `${message.role === 'assistant' ? 'Assistant' : 'User'}: ${normalizeWhitespace(message.content)}`;
    const wordCount = line.split(' ').filter(Boolean).length;

    if (selected.length > 0 && totalWords + wordCount > maxWords) {
      break;
    }

    selected.unshift(line);
    totalWords += wordCount;
  }

  return truncateWords(selected.join('\n'), maxWords);
}

export function createConversationTitle(text = '') {
  const clean = truncateWords(text, 8);
  return clean || 'Cuoc tro chuyen moi';
}

export function serializeConversation(conversation) {
  return {
    id: conversation._id.toString(),
    title: conversation.title,
    memory: conversation.memory || { shortTerm: '', longTerm: '' },
    lastMessageAt: conversation.lastMessageAt,
    updatedAt: conversation.updatedAt,
    messages: (conversation.messages || []).map((message) => ({
      id: message._id?.toString?.() || `${message.role}-${message.createdAt}`,
      role: message.role,
      content: message.content,
      citations: message.citations || [],
      createdAt: message.createdAt,
    })),
  };
}
