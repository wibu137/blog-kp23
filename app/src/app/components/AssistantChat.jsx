'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { HiOutlinePlus, HiOutlineSparkles } from 'react-icons/hi2';

const defaultSuggestions = [
  'Tom tat bai viet moi nhat tren blog',
  'Blog KP23 dang noi bat chu de nao?',
  'Cho minh thong tin lien quan den moi truong',
];

function formatTime(value) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(value));
}

function CitationList({ citations = [] }) {
  if (!citations.length) {
    return null;
  }

  return (
    <div className='mt-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3 text-xs text-slate-600'>
      <p className='font-semibold uppercase tracking-[0.2em] text-emerald-700'>
        Nguon tham chieu
      </p>
      <div className='mt-2 space-y-2'>
        {citations.map((citation, index) => {
          const isInternalLink = citation.source?.startsWith('/');

          return (
            <div
              key={`${citation.source}-${index}`}
              className='rounded-xl bg-white p-3 shadow-sm'
            >
              <p className='font-semibold text-slate-800'>{citation.title}</p>
              <p className='mt-1 line-clamp-2'>{citation.excerpt}</p>
              {isInternalLink ? (
                <Link
                  href={citation.source}
                  className='mt-2 inline-flex text-emerald-700 hover:underline'
                >
                  {citation.source}
                </Link>
              ) : (
                <p className='mt-2 text-slate-500'>{citation.source}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[90%] rounded-[28px] px-4 py-3 shadow-sm sm:max-w-[75%] ${
          isAssistant
            ? 'rounded-bl-md border border-white/70 bg-white text-slate-800'
            : 'rounded-br-md bg-gradient-to-r from-emerald-600 to-teal-500 text-white'
        }`}
      >
        <p className='whitespace-pre-wrap text-sm leading-7 sm:text-[15px]'>
          {message.content}
        </p>
        <p
          className={`mt-2 text-[11px] ${
            isAssistant ? 'text-slate-400' : 'text-emerald-50'
          }`}
        >
          {formatTime(message.createdAt)}
        </p>
        {isAssistant ? <CitationList citations={message.citations} /> : null}
      </div>
    </div>
  );
}

function GuestNotice() {
  return (
    <div className='rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800'>
      Che do guest dang bat. Chatbot chi tra loi tu tai lieu public danh cho
      khach.
    </div>
  );
}

export default function AssistantChat() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState('');
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const [streamingId, setStreamingId] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    void loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  async function loadConversations(nextActiveId) {
    setIsLoadingList(true);
    setError('');

    try {
      const response = await fetch('/api/chat/conversations', {
        cache: 'no-store',
      });
      const payload = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setIsGuestMode(true);
          setConversations([]);
          setActiveConversationId('');

          if (!nextActiveId) {
            setMessages([]);
          }

          return;
        }

        throw new Error(payload.error || 'Khong the tai danh sach hoi thoai.');
      }

      setIsGuestMode(false);
      const list = payload.conversations || [];
      setConversations(list);

      const targetId = nextActiveId || activeConversationId || list[0]?.id || '';
      if (targetId) {
        setActiveConversationId(targetId);
        await loadConversation(targetId);
      } else {
        setMessages([]);
      }
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoadingList(false);
    }
  }

  async function loadConversation(conversationId) {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setIsLoadingConversation(true);
    setError('');

    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}`, {
        cache: 'no-store',
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Khong the tai hoi thoai.');
      }

      setMessages(payload.conversation?.messages || []);
      setActiveConversationId(payload.conversation?.id || conversationId);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoadingConversation(false);
    }
  }

  async function createConversation(initialMessage = '') {
    const response = await fetch('/api/chat/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: initialMessage }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || 'Khong the tao hoi thoai moi.');
    }

    const conversation = payload.conversation;
    setConversations((current) => [
      {
        id: conversation.id,
        title: conversation.title,
        lastMessageAt: conversation.lastMessageAt,
        preview: '',
      },
      ...current,
    ]);
    setActiveConversationId(conversation.id);
    setMessages(conversation.messages || []);

    return conversation.id;
  }

  async function handleCreateConversation() {
    setError('');

    try {
      if (isGuestMode) {
        setMessages([]);
        setActiveConversationId('');
        return;
      }

      await createConversation();
    } catch (createError) {
      setError(createError.message);
    }
  }

  async function handleSend(prefilledMessage) {
    const content = (prefilledMessage ?? draft).trim();
    if (!content || isStreaming) {
      return;
    }

    setError('');
    setDraft('');
    setIsStreaming(true);

    const tempUserMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      citations: [],
      createdAt: new Date().toISOString(),
    };
    const tempAssistantMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      citations: [],
      createdAt: new Date().toISOString(),
    };

    const historyPayload = messages.map((message) => ({
      role: message.role,
      content: message.content,
      citations: message.citations || [],
      createdAt: message.createdAt,
    }));

    setStreamingId(tempAssistantMessage.id);
    setMessages((current) => [...current, tempUserMessage, tempAssistantMessage]);

    let conversationId = activeConversationId;

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          message: content,
          messages: historyPayload,
        }),
      });

      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Khong the nhan phan hoi tu AI.');
      }

      const headerConversationId = response.headers.get('X-Conversation-Id');
      if (headerConversationId) {
        conversationId = headerConversationId;
        setActiveConversationId(conversationId);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamingText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        streamingText += decoder.decode(value, { stream: true });
        setMessages((current) =>
          current.map((message) =>
            message.id === tempAssistantMessage.id
              ? { ...message, content: streamingText }
              : message
          )
        );
      }

      if (!isGuestMode) {
        await loadConversations(conversationId || activeConversationId);
      }
    } catch (sendError) {
      setError(sendError.message);
      setMessages((current) =>
        current.filter(
          (message) =>
            message.id !== tempUserMessage.id &&
            message.id !== tempAssistantMessage.id
        )
      );
      setDraft(content);
    } finally {
      setIsStreaming(false);
      setStreamingId('');
    }
  }

  return (
    <div className='mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:flex-row lg:gap-8 lg:py-8'>
      <aside className='overflow-hidden rounded-[32px] border border-emerald-100 bg-white/85 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur lg:w-[320px]'>
        <div className='border-b border-emerald-100 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.2),_transparent_55%),linear-gradient(135deg,_rgba(236,253,245,0.9),_rgba(255,255,255,1))] p-5'>
          <p className='text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700'>
            KP23 Assistant
          </p>
          <h1 className='mt-2 text-2xl font-semibold text-slate-900'>
            Chatbot cho khach
          </h1>
          <p className='mt-2 text-sm leading-6 text-slate-600'>
            Tra loi cau hoi cua khach dua tren tai lieu public va streaming
            response.
          </p>
          <button
            type='button'
            onClick={handleCreateConversation}
            className='mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800'
          >
            <HiOutlinePlus className='h-4 w-4' />
            Cuoc tro chuyen moi
          </button>
        </div>

        <div className='max-h-[520px] space-y-2 overflow-y-auto p-3'>
          {isLoadingList ? (
            <p className='px-3 py-6 text-sm text-slate-500'>
              Dang tai hoi thoai...
            </p>
          ) : isGuestMode ? (
            <p className='px-3 py-6 text-sm text-slate-500'>
              Khach co the hoi ngay. Lich su chi duoc luu khi dang nhap.
            </p>
          ) : conversations.length === 0 ? (
            <p className='px-3 py-6 text-sm text-slate-500'>
              Chua co hoi thoai nao. Hay bat dau bang mot cau hoi moi.
            </p>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                type='button'
                onClick={() => loadConversation(conversation.id)}
                className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                  activeConversationId === conversation.id
                    ? 'bg-emerald-50 text-slate-900 shadow-sm'
                    : 'bg-transparent text-slate-600 hover:bg-slate-50'
                }`}
              >
                <p className='line-clamp-1 text-sm font-semibold'>
                  {conversation.title}
                </p>
                <p className='mt-1 line-clamp-2 text-xs leading-5 text-slate-500'>
                  {conversation.preview || 'Chua co tin nhan'}
                </p>
                <p className='mt-2 text-[11px] uppercase tracking-[0.2em] text-slate-400'>
                  {formatTime(conversation.lastMessageAt)}
                </p>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className='flex min-h-[70vh] flex-1 flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(248,250,252,1),_rgba(236,253,245,0.9))] shadow-[0_30px_80px_rgba(15,23,42,0.1)]'>
        <div className='border-b border-white/70 bg-white/70 px-5 py-4 backdrop-blur sm:px-6'>
          <div className='flex items-center gap-3'>
            <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'>
              <HiOutlineSparkles className='h-5 w-5' />
            </div>
            <div>
              <p className='text-sm font-semibold text-slate-900'>
                Tro ly AI cho khach cua KP23&apos;s Blog
              </p>
              <p className='text-xs text-slate-500'>
                Chi tra loi dua tren tai lieu cong khai duoc cung cap
              </p>
            </div>
          </div>
        </div>

        <div className='flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6'>
          {isGuestMode ? <GuestNotice /> : null}

          {error ? (
            <div className='rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>
              {error}
            </div>
          ) : null}

          {isLoadingConversation ? (
            <div className='rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500'>
              Dang tai noi dung hoi thoai...
            </div>
          ) : messages.length === 0 ? (
            <div className='grid gap-4 lg:grid-cols-[1.2fr_0.8fr]'>
              <div className='rounded-[28px] border border-white/70 bg-white px-5 py-6 shadow-sm'>
                <p className='text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700'>
                  Cach hoat dong
                </p>
                <h2 className='mt-3 text-3xl font-semibold leading-tight text-slate-900'>
                  Hoi dap cho khach tu knowledge base public
                </h2>
                <p className='mt-4 text-sm leading-7 text-slate-600'>
                  Chatbot nay chi tong hop tu tai lieu public trong Chroma hoac
                  cac bai viet tren blog. Neu khong du thong tin, he thong se
                  noi ro thay vi tu suy doan.
                </p>
              </div>

              <div className='rounded-[28px] border border-emerald-100 bg-[linear-gradient(160deg,_rgba(16,185,129,0.08),_rgba(255,255,255,1))] p-5'>
                <p className='text-sm font-semibold text-slate-900'>
                  Goi y cau hoi
                </p>
                <div className='mt-4 space-y-3'>
                  {defaultSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type='button'
                      onClick={() => handleSend(suggestion)}
                      className='w-full rounded-2xl border border-white bg-white px-4 py-3 text-left text-sm text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-700'
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}

          {isStreaming && streamingId ? (
            <p className='text-xs uppercase tracking-[0.25em] text-emerald-700'>
              Dang streaming phan hoi...
            </p>
          ) : null}

          <div ref={bottomRef} />
        </div>

        <div className='border-t border-white/70 bg-white/80 px-4 py-4 backdrop-blur sm:px-6'>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSend();
            }}
            className='rounded-[28px] border border-emerald-100 bg-white p-3 shadow-sm'
          >
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder='Nhap cau hoi cua khach ve blog, san pham hoac knowledge base...'
              rows={3}
              className='w-full resize-none border-0 bg-transparent px-2 py-2 text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-400'
            />
            <div className='mt-3 flex items-center justify-between gap-3'>
              <p className='text-xs text-slate-400'>
                Neu khong co du lieu, chatbot se noi ro.
              </p>
              <button
                type='submit'
                disabled={isStreaming || !draft.trim()}
                className='rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {isStreaming ? 'Dang gui...' : 'Gui'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
