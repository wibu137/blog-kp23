'use client';

import { SignInButton, SignedIn, SignedOut, useUser } from '@clerk/nextjs';
import { Alert, Button, Spinner, Textarea } from 'flowbite-react';
import { useEffect, useMemo, useState } from 'react';

function buildCommentTree(flatComments) {
  const map = new Map();
  const roots = [];

  flatComments.forEach((comment) => {
    map.set(comment._id, { ...comment, replies: [] });
  });

  map.forEach((comment) => {
    if (comment.parentCommentId && map.has(comment.parentCommentId)) {
      map.get(comment.parentCommentId).replies.push(comment);
      return;
    }

    roots.push(comment);
  });

  const sortTree = (nodes, depth = 0) => {
    nodes.sort((a, b) => {
      const first = new Date(a.createdAt).getTime();
      const second = new Date(b.createdAt).getTime();
      return depth === 0 ? second - first : first - second;
    });

    nodes.forEach((node) => sortTree(node.replies, depth + 1));
  };

  sortTree(roots);
  return roots;
}

function CommentItem({
  comment,
  currentUser,
  isAdmin,
  onReply,
  onDelete,
  replyDrafts,
  setReplyDrafts,
  submittingReplyId,
  processingId,
  depth = 0,
}) {
  const currentUserId = currentUser?.publicMetadata?.userMongoId;
  const isOwner = currentUserId && comment.userId === currentUserId;
  const canDelete = Boolean(isOwner || isAdmin);
  const canReply = Boolean(currentUser);
  const isReplying = replyDrafts.openFor === comment._id;
  const replyValue = replyDrafts.values[comment._id] || '';

  return (
    <article
      className='rounded-2xl border border-slate-200 p-4 shadow-sm dark:border-slate-700'
      style={{ marginLeft: `${Math.min(depth, 4) * 20}px` }}
    >
      <div className='mb-3 flex items-start gap-3'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={comment.profilePicture || '/favicon.ico'}
          alt={comment.username}
          className='h-10 w-10 rounded-full object-cover'
        />
        <div className='min-w-0 flex-1'>
          <p className='truncate font-medium text-slate-900 dark:text-slate-100'>
            {comment.username}
          </p>
          <p className='text-xs text-slate-500 dark:text-slate-400'>
            {new Date(comment.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <p className='whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200'>
        {comment.content}
      </p>

      <div className='mt-4 flex flex-wrap items-center gap-3 text-sm'>
        {canReply && (
          <button
            type='button'
            className='font-medium text-teal-600 hover:underline dark:text-teal-400'
            onClick={() =>
              setReplyDrafts((prev) => ({
                ...prev,
                openFor: prev.openFor === comment._id ? null : comment._id,
              }))
            }
          >
            Trả lời
          </button>
        )}

        {canDelete && (
          <button
            type='button'
            className='font-medium text-red-600 hover:underline dark:text-red-400'
            onClick={() => onDelete(comment._id)}
            disabled={processingId === comment._id}
          >
            {processingId === comment._id ? 'Đang xóa...' : 'Xóa'}
          </button>
        )}
      </div>

      {isReplying && (
        <form
          className='mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-900'
          onSubmit={(e) => onReply(e, comment._id)}
        >
          <Textarea
            rows={3}
            placeholder='Viết trả lời của bạn...'
            value={replyValue}
            maxLength={1000}
            onChange={(e) =>
              setReplyDrafts((prev) => ({
                ...prev,
                values: {
                  ...prev.values,
                  [comment._id]: e.target.value,
                },
              }))
            }
          />
          <div className='mt-3 flex items-center justify-between gap-3'>
            <button
              type='button'
              className='text-sm text-slate-500 hover:underline dark:text-slate-400'
              onClick={() =>
                setReplyDrafts((prev) => ({
                  ...prev,
                  openFor: null,
                }))
              }
            >
              Hủy
            </button>
            <Button
              type='submit'
              size='sm'
              gradientDuoTone='greenToBlue'
              disabled={submittingReplyId === comment._id}
            >
              {submittingReplyId === comment._id
                ? 'Đang gửi...'
                : 'Gửi trả lời'}
            </Button>
          </div>
        </form>
      )}

      {comment.replies.length > 0 && (
        <div className='mt-4 space-y-4 border-l border-slate-200 pl-4 dark:border-slate-700'>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              currentUser={currentUser}
              isAdmin={isAdmin}
              onReply={onReply}
              onDelete={onDelete}
              replyDrafts={replyDrafts}
              setReplyDrafts={setReplyDrafts}
              submittingReplyId={submittingReplyId}
              processingId={processingId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </article>
  );
}

export default function CommentSection({ postId }) {
  const { user } = useUser();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittingReplyId, setSubmittingReplyId] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState({
    openFor: null,
    values: {},
  });

  const isAdmin = Boolean(user?.publicMetadata?.isAdmin);

  const commentTree = useMemo(() => buildCommentTree(comments), [comments]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/comment/get', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ postId }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to load comments');
        }

        setComments(data.comments || []);
        setError(null);
      } catch (fetchError) {
        setError(fetchError.message || 'Failed to load comments');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const createComment = async ({ content: value, parentCommentId = null }) => {
    const res = await fetch('/api/comment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId,
        content: value,
        parentCommentId,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to create comment');
    }

    setComments((prev) => [data.comment, ...prev]);
    setError(null);
    setNotice('Bình luận đã được đăng thành công.');

    return data.comment;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Vui lòng nhập nội dung bình luận.');
      return;
    }

    try {
      setSubmitting(true);
      await createComment({ content: content.trim() });
      setContent('');
    } catch (submitError) {
      setError(submitError.message || 'Failed to create comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (e, parentCommentId) => {
    e.preventDefault();
    const value = replyDrafts.values[parentCommentId]?.trim();

    if (!value) {
      setError('Vui lòng nhập nội dung trả lời.');
      return;
    }

    try {
      setSubmittingReplyId(parentCommentId);
      await createComment({ content: value, parentCommentId });
      setReplyDrafts((prev) => ({
        openFor: null,
        values: {
          ...prev.values,
          [parentCommentId]: '',
        },
      }));
    } catch (replyError) {
      setError(replyError.message || 'Failed to create reply');
    } finally {
      setSubmittingReplyId(null);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      setProcessingId(commentId);
      const res = await fetch('/api/comment/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentId }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete comment');
      }

      setComments((prev) =>
        prev.filter((comment) => !data.deletedIds.includes(comment._id))
      );
      setNotice('Đã xóa bình luận.');
      setError(null);
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to delete comment');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className='mx-auto mt-12 w-full max-w-2xl border-t border-slate-200 px-3 pt-8 dark:border-slate-700'>
      <div className='mb-6 flex items-center justify-between gap-3'>
        <div>
          <h2 className='text-2xl font-semibold'>Bình luận</h2>
          <p className='text-sm text-slate-500 dark:text-slate-400'>
            {comments.length} bình luận hiển thị trong phiên của bạn
          </p>
        </div>
      </div>

      <SignedOut>
        <div className='mb-6 rounded-2xl border border-dashed border-teal-300 bg-teal-50 p-4 text-sm text-slate-700 dark:border-teal-700 dark:bg-slate-900 dark:text-slate-200'>
          Đăng nhập để tham gia bình luận và trả lời người khác.
          <div className='mt-3'>
            <SignInButton mode='modal'>
              <Button gradientDuoTone='greenToBlue'>
                Đăng nhập để bình luận
              </Button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <form
          onSubmit={handleSubmit}
          className='mb-8 rounded-2xl border border-slate-200 p-4 shadow-sm dark:border-slate-700'
        >
          <div className='mb-3 flex items-center gap-3'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user?.imageUrl || '/favicon.ico'}
              alt={user?.username || 'User avatar'}
              className='h-10 w-10 rounded-full object-cover'
            />
            <div>
              <p className='font-medium text-slate-900 dark:text-slate-100'>
                {user?.username || user?.fullName || 'Bạn'}
              </p>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Chia sẻ ý kiến của bạn và trả lời người khác ngay dưới bài viết.
              </p>
            </div>
          </div>
          <Textarea
            rows={4}
            placeholder='Viết bình luận của bạn...'
            value={content}
            maxLength={1000}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className='mt-3 flex items-center justify-between gap-3'>
            <span className='text-xs text-slate-500 dark:text-slate-400'>
              {content.trim().length}/1000 ký tự
            </span>
            <Button
              type='submit'
              gradientDuoTone='greenToBlue'
              disabled={submitting}
            >
              {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
            </Button>
          </div>
        </form>
      </SignedIn>

      {notice && (
        <Alert color='success' className='mb-4'>
          {notice}
        </Alert>
      )}

      {error && (
        <Alert color='failure' className='mb-6'>
          {error}
        </Alert>
      )}

      {loading ? (
        <div className='flex items-center gap-3 py-8 text-slate-500 dark:text-slate-400'>
          <Spinner size='sm' />
          <span>Đang tải bình luận...</span>
        </div>
      ) : commentTree.length === 0 ? (
        <div className='rounded-2xl bg-slate-50 p-5 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300'>
          Chưa có bình luận nào. Hãy là người đầu tiên để lại ý kiến.
        </div>
      ) : (
        <div className='space-y-4'>
          {commentTree.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              currentUser={user}
              isAdmin={isAdmin}
              onReply={handleReply}
              onDelete={handleDelete}
              replyDrafts={replyDrafts}
              setReplyDrafts={setReplyDrafts}
              submittingReplyId={submittingReplyId}
              processingId={processingId}
            />
          ))}
        </div>
      )}
    </section>
  );
}
