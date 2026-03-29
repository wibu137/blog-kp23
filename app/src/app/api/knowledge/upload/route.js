import { requireAdminUser } from '../../../../lib/knowledge/admin';
import {
  CHROMA_UNAVAILABLE_MESSAGE,
  isChromaConfigured,
  isChromaConnectionError,
  saveUploadedKnowledgeFiles,
  syncKnowledgeBase,
} from '../../../../lib/knowledge/sync.mjs';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    await requireAdminUser();

    const formData = await req.formData();
    const visibility = String(formData.get('visibility') || 'authenticated');
    const files = formData.getAll('files');

    const savedFiles = await saveUploadedKnowledgeFiles(files, { visibility });
    const displayFiles = savedFiles.map((filePath) =>
      path.relative(process.cwd(), filePath).replace(/\\/g, '/')
    );

    if (!savedFiles.length) {
      return Response.json(
        { message: 'Khong co file PDF, DOCX hoac TXT hop le de upload.' },
        { status: 400 }
      );
    }

    if (!isChromaConfigured()) {
      return Response.json({
        uploaded: savedFiles.length,
        savedFiles: displayFiles,
        synced: false,
        message:
          'Da luu file vao knowledge-base, nhung Chroma chua duoc cau hinh nen chua ingest.',
      });
    }

    try {
      const summary = await syncKnowledgeBase({
        filePaths: savedFiles,
        force: true,
        cleanupMissing: false,
      });

      return Response.json({
        uploaded: savedFiles.length,
        savedFiles: displayFiles,
        synced: true,
        summary,
      });
    } catch (error) {
      if (isChromaConnectionError(error)) {
        return Response.json({
          uploaded: savedFiles.length,
          savedFiles: displayFiles,
          synced: false,
          message: `${CHROMA_UNAVAILABLE_MESSAGE} File da duoc luu vao knowledge-base, nhung chua ingest vao Chroma.`,
          warning: CHROMA_UNAVAILABLE_MESSAGE,
        });
      }

      throw error;
    }
  } catch (error) {
    if (error.message === 'UNAUTHORIZED') {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.error('Knowledge upload failed:', error);
    return Response.json(
      { message: error.message || 'Knowledge upload failed' },
      { status: 500 }
    );
  }
}
