'use client';

import { SignInButton, SignedIn, SignedOut, useUser } from '@clerk/nextjs';
import { Alert, Button, Spinner, Textarea } from 'flowbite-react';
import { useEffect, useState } from 'react';

export default function CommentSection({ postId }) {
  const { user } = useUser();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Vui long nhap noi dung binh luan.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/comment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          content,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create comment');
      }

      setComments((prev) => [data.comment, ...prev]);
      setContent('');
      setError(null);
    } catch (submitError) {
      setError(submitError.message || 'Failed to create comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className='mx-auto mt-12 w-full max-w-2xl border-t border-slate-200 px-3 pt-8 dark:border-slate-700'>
      <div className='mb-6 flex items-center justify-between gap-3'>
        <div>
          <h2 className='text-2xl font-semibold'>Binh luan</h2>
          <p className='text-sm text-slate-500 dark:text-slate-400'>
            {comments.length} binh luan cho bai viet nay
          </p>
        </div>
      </div>

      <SignedOut>
        <div className='mb-6 rounded-2xl border border-dashed border-teal-300 bg-teal-50 p-4 text-sm text-slate-700 dark:border-teal-700 dark:bg-slate-900 dark:text-slate-200'>
          Dang nhap de tham gia binh luan.
          <div className='mt-3'>
            <SignInButton mode='modal'>
              <Button gradientDuoTone='greenToBlue'>Dang nhap de binh luan</Button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <form onSubmit={handleSubmit} className='mb-8 rounded-2xl border border-slate-200 p-4 shadow-sm dark:border-slate-700'>
          <div className='mb-3 flex items-center gap-3'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user?.imageUrl || '/favicon.ico'}
              alt={user?.username || 'User avatar'}
              className='h-10 w-10 rounded-full object-cover'
            />
            <div>
              <p className='font-medium text-slate-900 dark:text-slate-100'>
                {user?.username || user?.fullName || 'Ban'}
              </p>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Chia se y kien cua ban mot cach lich su va huu ich.
              </p>
            </div>
          </div>
          <Textarea
            rows={4}
            placeholder='Viet binh luan cua ban...'
            value={content}
            maxLength={1000}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className='mt-3 flex items-center justify-between gap-3'>
            <span className='text-xs text-slate-500 dark:text-slate-400'>
              {content.trim().length}/1000 ky tu
            </span>
            <Button
              type='submit'
              gradientDuoTone='greenToBlue'
              disabled={submitting}
            >
              {submitting ? 'Dang gui...' : 'Gui binh luan'}
            </Button>
          </div>
        </form>
      </SignedIn>

      {error && (
        <Alert color='failure' className='mb-6'>
          {error}
        </Alert>
      )}

      {loading ? (
        <div className='flex items-center gap-3 py-8 text-slate-500 dark:text-slate-400'>
          <Spinner size='sm' />
          <span>Dang tai binh luan...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className='rounded-2xl bg-slate-50 p-5 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300'>
          Chua co binh luan nao. Hay la nguoi dau tien de lai y kien.
        </div>
      ) : (
        <div className='space-y-4'>
          {comments.map((comment) => (
            <article
              key={comment._id}
              className='rounded-2xl border border-slate-200 p-4 shadow-sm dark:border-slate-700'
            >
              <div className='mb-3 flex items-center gap-3'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={comment.profilePicture || '/favicon.ico'}
                  alt={comment.username}
                  className='h-10 w-10 rounded-full object-cover'
                />
                <div className='min-w-0'>
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
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
