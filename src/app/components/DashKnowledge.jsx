'use client';

import {
  Alert,
  Badge,
  Button,
  FileInput,
  Modal,
  Select,
  Spinner,
  Table,
} from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

function formatDate(value) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString('vi-VN');
}

function formatBytes(value) {
  if (typeof value !== 'number') {
    return '-';
  }

  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function getBadgeColor(status) {
  if (status === 'synced') {
    return 'success';
  }

  if (status === 'changed' || status === 'pending') {
    return 'warning';
  }

  if (status === 'orphaned') {
    return 'failure';
  }

  return 'gray';
}

export default function DashKnowledge() {
  const { user, isLoaded } = useUser();
  const [documents, setDocuments] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    synced: 0,
    changed: 0,
    pending: 0,
    orphaned: 0,
  });
  const [visibility, setVisibility] = useState('authenticated');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [syncingMode, setSyncingMode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showChunksModal, setShowChunksModal] = useState(false);
  const [activeSource, setActiveSource] = useState('');
  const [chunks, setChunks] = useState([]);
  const [loadingChunks, setLoadingChunks] = useState(false);
  const [deletingSource, setDeletingSource] = useState('');

  useEffect(() => {
    if (user?.publicMetadata?.isAdmin) {
      void loadDocuments();
    }
  }, [user?.publicMetadata?.isAdmin]);

  async function loadDocuments() {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/knowledge/documents', {
        cache: 'no-store',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Khong the tai danh sach tai lieu.');
      }

      setDocuments(data.documents || []);
      setSummary(
        data.summary || {
          total: 0,
          synced: 0,
          changed: 0,
          pending: 0,
          orphaned: 0,
        }
      );
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(event) {
    event.preventDefault();

    if (!selectedFiles.length) {
      setError('Hay chon it nhat mot file PDF, DOCX hoac TXT.');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setMessage('');

      const formData = new FormData();
      formData.append('visibility', visibility);

      for (const file of selectedFiles) {
        formData.append('files', file);
      }

      const res = await fetch('/api/knowledge/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Upload that bai.');
      }

      setSelectedFiles([]);
      const input = document.getElementById('knowledge-files');
      if (input) {
        input.value = '';
      }

      if (data.summary?.errors?.length) {
        setError(
          data.summary.errors
            .map((item) => `${item.file}: ${item.message}`)
            .join(' | ')
        );
      }

      setMessage(
        data.synced
          ? `Da upload ${data.uploaded} file va ingest ngay vao Chroma.`
          : data.message || 'Da upload file vao knowledge-base.'
      );
      await loadDocuments();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSync(mode) {
    try {
      setSyncingMode(mode);
      setError('');
      setMessage('');

      const res = await fetch('/api/knowledge/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Sync that bai.');
      }

      if (data.summary?.errors?.length) {
        setError(
          data.summary.errors
            .map((item) => `${item.file}: ${item.message}`)
            .join(' | ')
        );
      }

      const summaryText = data.summary
        ? `Da xu ly ${data.summary.processed} file, ingest ${data.summary.ingested}, bo qua ${data.summary.skipped}, removed ${data.summary.removed}.`
        : 'Sync hoan tat.';
      setMessage(summaryText);
      await loadDocuments();
    } catch (syncError) {
      setError(syncError.message);
    } finally {
      setSyncingMode('');
    }
  }

  async function handleViewChunks(source) {
    try {
      setShowChunksModal(true);
      setActiveSource(source);
      setLoadingChunks(true);
      setChunks([]);
      setError('');

      const res = await fetch('/api/knowledge/chunks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ source }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Khong the tai chunks.');
      }

      setChunks(data.chunks || []);
    } catch (chunkError) {
      setError(chunkError.message);
    } finally {
      setLoadingChunks(false);
    }
  }

  async function handleDelete(source) {
    const confirmed = window.confirm(
      `Ban co chac muon xoa tai lieu ${source} khoi knowledge base va Chroma?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingSource(source);
      setError('');
      setMessage('');

      const res = await fetch('/api/knowledge/documents', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ source, removeFile: true }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Xoa tai lieu that bai.');
      }

      setMessage(`Da xoa ${source} khoi knowledge base.`);
      await loadDocuments();
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setDeletingSource('');
    }
  }

  if (!user?.publicMetadata?.isAdmin && isLoaded) {
    return (
      <div className='flex flex-col items-center justify-center h-full w-full py-7'>
        <h1 className='text-2xl font-semibold'>Ban khong phai quan tri vien!</h1>
      </div>
    );
  }

  return (
    <div className='w-full p-3'>
      <div className='grid gap-4 md:grid-cols-5'>
        <div className='rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-800'>
          <p className='text-sm text-gray-500'>Tong tai lieu</p>
          <p className='mt-2 text-2xl font-semibold'>{summary.total}</p>
        </div>
        <div className='rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-800'>
          <p className='text-sm text-gray-500'>Da dong bo</p>
          <p className='mt-2 text-2xl font-semibold text-emerald-600'>
            {summary.synced}
          </p>
        </div>
        <div className='rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-800'>
          <p className='text-sm text-gray-500'>Can cap nhat</p>
          <p className='mt-2 text-2xl font-semibold text-amber-600'>
            {summary.changed}
          </p>
        </div>
        <div className='rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-800'>
          <p className='text-sm text-gray-500'>Chua ingest</p>
          <p className='mt-2 text-2xl font-semibold text-orange-500'>
            {summary.pending}
          </p>
        </div>
        <div className='rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-800'>
          <p className='text-sm text-gray-500'>Orphaned</p>
          <p className='mt-2 text-2xl font-semibold text-rose-600'>
            {summary.orphaned}
          </p>
        </div>
      </div>

      <div className='mt-6 grid gap-6 xl:grid-cols-[420px_1fr]'>
        <div className='rounded-2xl border bg-white p-5 shadow-sm dark:bg-gray-800'>
          <h2 className='text-lg font-semibold'>Upload tai lieu</h2>
          <p className='mt-2 text-sm text-gray-500'>
            Upload file vao `knowledge-base` va ingest ngay vao Chroma.
          </p>

          <form className='mt-5 space-y-4' onSubmit={handleUpload}>
            <div>
              <label className='mb-2 block text-sm font-medium'>Quyen truy cap</label>
              <Select
                value={visibility}
                onChange={(event) => setVisibility(event.target.value)}
              >
                <option value='public'>Public</option>
                <option value='authenticated'>Authenticated</option>
                <option value='admin'>Admin</option>
              </Select>
            </div>

            <div>
              <label className='mb-2 block text-sm font-medium'>Tai lieu</label>
              <FileInput
                id='knowledge-files'
                multiple
                accept='.pdf,.docx,.txt'
                onChange={(event) =>
                  setSelectedFiles(Array.from(event.target.files || []))
                }
              />
              <p className='mt-2 text-xs text-gray-500'>
                Ho tro PDF, DOCX, TXT. File trung ten se duoc ghi de.
              </p>
            </div>

            <Button type='submit' disabled={uploading} gradientDuoTone='greenToBlue'>
              {uploading ? 'Dang upload...' : 'Upload va ingest'}
            </Button>
          </form>

          <div className='mt-8 border-t pt-5'>
            <h3 className='text-sm font-semibold uppercase tracking-wide text-gray-500'>
              Cong cu dong bo
            </h3>
            <div className='mt-4 flex flex-wrap gap-3'>
              <Button
                color='light'
                onClick={() => handleSync('incremental')}
                disabled={Boolean(syncingMode)}
              >
                {syncingMode === 'incremental'
                  ? 'Dang sync...'
                  : 'Sync file thay doi'}
              </Button>
              <Button
                color='warning'
                onClick={() => handleSync('reindex')}
                disabled={Boolean(syncingMode)}
              >
                {syncingMode === 'reindex' ? 'Dang re-index...' : 'Re-index toan bo'}
              </Button>
              <Button
                color='failure'
                onClick={() => handleSync('reset')}
                disabled={Boolean(syncingMode)}
              >
                {syncingMode === 'reset' ? 'Dang reset...' : 'Reset collection'}
              </Button>
            </div>
          </div>
        </div>

        <div className='rounded-2xl border bg-white p-5 shadow-sm dark:bg-gray-800'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <h2 className='text-lg font-semibold'>Documents va chunks da ingest</h2>
              <p className='mt-1 text-sm text-gray-500'>
                Theo doi trang thai dong bo giua file local va Chroma.
              </p>
            </div>
            <Button color='light' onClick={() => loadDocuments()} disabled={loading}>
              Lam moi
            </Button>
          </div>

          {message ? (
            <Alert color='success' className='mt-4'>
              {message}
            </Alert>
          ) : null}

          {error ? (
            <Alert color='failure' className='mt-4'>
              {error}
            </Alert>
          ) : null}

          <div className='mt-5 overflow-x-auto'>
            {loading ? (
              <div className='flex items-center gap-3 py-10 text-sm text-gray-500'>
                <Spinner size='sm' />
                Dang tai tai lieu...
              </div>
            ) : documents.length === 0 ? (
              <p className='py-10 text-sm text-gray-500'>
                Chua co tai lieu nao trong knowledge base.
              </p>
            ) : (
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell>Source</Table.HeadCell>
                  <Table.HeadCell>Visibility</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                  <Table.HeadCell>Chunks</Table.HeadCell>
                  <Table.HeadCell>Size</Table.HeadCell>
                  <Table.HeadCell>Updated</Table.HeadCell>
                  <Table.HeadCell>Actions</Table.HeadCell>
                </Table.Head>
                {documents.map((document) => (
                  <Table.Body className='divide-y' key={document.source}>
                    <Table.Row className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                      <Table.Cell className='min-w-72'>
                        <div>
                          <p className='font-medium text-gray-900 dark:text-white'>
                            {document.title}
                          </p>
                          <p className='mt-1 text-xs text-gray-500'>{document.source}</p>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color='gray'>{document.visibility}</Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={getBadgeColor(document.status)}>
                          {document.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>{document.chunkCount ?? '-'}</Table.Cell>
                      <Table.Cell>{formatBytes(document.size)}</Table.Cell>
                      <Table.Cell>{formatDate(document.updatedAt)}</Table.Cell>
                      <Table.Cell>
                        <div className='flex flex-wrap gap-2'>
                          <Button
                            size='xs'
                            color='light'
                            onClick={() => handleViewChunks(document.source)}
                          >
                            View chunks
                          </Button>
                          <Button
                            size='xs'
                            color='failure'
                            onClick={() => handleDelete(document.source)}
                            disabled={deletingSource === document.source}
                          >
                            {deletingSource === document.source ? 'Dang xoa...' : 'Xoa'}
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  </Table.Body>
                ))}
              </Table>
            )}
          </div>
        </div>
      </div>

      <Modal
        show={showChunksModal}
        size='4xl'
        onClose={() => setShowChunksModal(false)}
      >
        <Modal.Header>Chunks cua tai lieu</Modal.Header>
        <Modal.Body>
          <p className='mb-4 text-sm text-gray-500'>{activeSource}</p>
          {loadingChunks ? (
            <div className='flex items-center gap-3 py-6 text-sm text-gray-500'>
              <Spinner size='sm' />
              Dang tai chunks...
            </div>
          ) : chunks.length === 0 ? (
            <p className='text-sm text-gray-500'>Chua co chunk nao cho tai lieu nay.</p>
          ) : (
            <div className='space-y-4'>
              {chunks.map((chunk) => (
                <div key={chunk.id} className='rounded-xl border p-4'>
                  <p className='text-xs font-semibold uppercase tracking-wide text-emerald-700'>
                    Chunk {chunk.chunkIndex + 1}
                    {chunk.chunkCount ? ` / ${chunk.chunkCount}` : ''}
                  </p>
                  <p className='mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-700 dark:text-gray-200'>
                    {chunk.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
