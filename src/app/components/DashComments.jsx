'use client';

import { useEffect, useState } from 'react';
import { Alert, Button, Table } from 'flowbite-react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function DashComments() {
  const { user } = useUser();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
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
          body: JSON.stringify({}),
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

    if (user?.publicMetadata?.isAdmin) {
      fetchComments();
    }
  }, [user?.publicMetadata?.isAdmin]);

  const handleApprove = async (commentId) => {
    try {
      setProcessingId(commentId);
      const res = await fetch('/api/comment/approve', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentId }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to approve comment');
      }

      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentId
            ? { ...comment, isApproved: true, ...data.comment }
            : comment
        )
      );
      setError(null);
    } catch (approveError) {
      setError(approveError.message || 'Failed to approve comment');
    } finally {
      setProcessingId(null);
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
      setError(null);
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to delete comment');
    } finally {
      setProcessingId(null);
    }
  };

  if (!user?.publicMetadata?.isAdmin) {
    return (
      <div className='flex flex-col items-center justify-center h-full w-full py-7'>
        <h1 className='text-2xl font-semibold'>You are not an admin!</h1>
      </div>
    );
  }

  return (
    <div className='table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500'>
      {error && (
        <Alert color='failure' className='mb-4'>
          {error}
        </Alert>
      )}

      {loading ? (
        <p>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p>No comments found.</p>
      ) : (
        <Table hoverable className='shadow-md'>
          <Table.Head>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Author</Table.HeadCell>
            <Table.HeadCell>Comment</Table.HeadCell>
            <Table.HeadCell>Post</Table.HeadCell>
            <Table.HeadCell>Date</Table.HeadCell>
            <Table.HeadCell>Approve</Table.HeadCell>
            <Table.HeadCell>Delete</Table.HeadCell>
          </Table.Head>
          {comments.map((comment) => (
            <Table.Body className='divide-y' key={comment._id}>
              <Table.Row className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                <Table.Cell>
                  {comment.isApproved ? (
                    <span className='rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'>
                      Approved
                    </span>
                  ) : (
                    <span className='rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'>
                      Pending
                    </span>
                  )}
                </Table.Cell>
                <Table.Cell>{comment.username}</Table.Cell>
                <Table.Cell className='min-w-80'>
                  <p className='line-clamp-3'>{comment.content}</p>
                  {comment.parentCommentId && (
                    <p className='mt-1 text-xs text-slate-500'>Reply</p>
                  )}
                </Table.Cell>
                <Table.Cell>
                  {comment.postSlug ? (
                    <Link
                      className='text-teal-600 hover:underline'
                      href={`/post/${comment.postSlug}`}
                    >
                      {comment.postTitle || comment.postSlug}
                    </Link>
                  ) : (
                    <span>{comment.postId}</span>
                  )}
                </Table.Cell>
                <Table.Cell>
                  {new Date(comment.createdAt).toLocaleDateString()}
                </Table.Cell>
                <Table.Cell>
                  {comment.isApproved ? (
                    <span className='text-slate-400'>Approved</span>
                  ) : (
                    <Button
                      size='xs'
                      gradientDuoTone='greenToBlue'
                      onClick={() => handleApprove(comment._id)}
                      disabled={processingId === comment._id}
                    >
                      {processingId === comment._id ? 'Working...' : 'Approve'}
                    </Button>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <button
                    type='button'
                    className='font-medium text-red-500 hover:underline'
                    onClick={() => handleDelete(comment._id)}
                    disabled={processingId === comment._id}
                  >
                    {processingId === comment._id ? 'Working...' : 'Delete'}
                  </button>
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          ))}
        </Table>
      )}
    </div>
  );
}
