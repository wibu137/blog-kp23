import { requireAdminUser } from '../../../../lib/knowledge/admin';
import {
  deleteKnowledgeDocument,
  getKnowledgeDocumentsOverview,
} from '../../../../lib/knowledge/sync.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdminUser();
    const data = await getKnowledgeDocumentsOverview();
    return Response.json(data);
  } catch (error) {
    if (error.message === 'UNAUTHORIZED') {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.error('Load knowledge documents failed:', error);
    return Response.json(
      { message: error.message || 'Failed to load knowledge documents' },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await requireAdminUser();
    const body = await req.json().catch(() => ({}));
    const source = String(body.source || '');

    if (!source) {
      return Response.json({ message: 'Source is required' }, { status: 400 });
    }

    const result = await deleteKnowledgeDocument(source, {
      removeFile: body.removeFile !== false,
    });

    return Response.json({ source, ...result });
  } catch (error) {
    if (error.message === 'UNAUTHORIZED') {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.error('Delete knowledge document failed:', error);
    return Response.json(
      { message: error.message || 'Failed to delete knowledge document' },
      { status: 500 }
    );
  }
}
