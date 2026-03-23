import {
  LONG_TERM_MEMORY_WORD_LIMIT,
  SHORT_TERM_MEMORY_WORD_LIMIT,
} from './constants';
import { buildTranscript, truncateWords } from './utils';

export function buildShortTermMemory(messages = []) {
  return buildTranscript(messages, SHORT_TERM_MEMORY_WORD_LIMIT);
}

export function buildLongTermMemory(user) {
  if (user?.assistantProfileSummary) {
    return truncateWords(
      user.assistantProfileSummary,
      LONG_TERM_MEMORY_WORD_LIMIT
    );
  }

  const profileLines = [
    user?.firstName || user?.lastName
      ? `Ten user: ${[user?.firstName, user?.lastName].filter(Boolean).join(' ')}.`
      : '',
    user?.username ? `Username: ${user.username}.` : '',
    user?.email ? `Email dang ky: ${user.email}.` : '',
    user?.isAdmin ? 'Vai tro: admin.' : 'Vai tro: user.',
    'Chi su dung thong tin nay de ca nhan hoa hoi thoai, khong dung de suy dien vuot qua du lieu duoc cung cap.',
  ]
    .filter(Boolean)
    .join(' ');

  return truncateWords(profileLines, LONG_TERM_MEMORY_WORD_LIMIT);
}
