import { requireAdminUser } from '../../../../lib/knowledge/admin';
import {
  CHROMA_UNAVAILABLE_MESSAGE,
  isChromaConnectionError,
  loadKnowledgeChunks,
} from '../../../../lib/knowledge/sync.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    await requireAdminUser();
    const body = await req.json().catch(() => ({}));
    const source = String(body.source || '');

    if (!source) {
      return Response.json({ message: 'Source is required' }, { status: 400 });
    }

    const chunks = await loadKnowledgeChunks(source);
    return Response.json({ chunks });
  } catch (error) {
    if (error.message === 'UNAUTHORIZED') {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (isChromaConnectionError(error)) {
      return Response.json({ message: CHROMA_UNAVAILABLE_MESSAGE }, { status: 503 });
    }

    console.error('Load chunks failed:', error);
    return Response.json(
      { message: error.message || 'Failed to load chunks' },
      { status: 500 }
    );
  }
}
