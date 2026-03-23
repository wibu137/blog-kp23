import { requireAdminUser } from '../../../../lib/knowledge/admin';
import { syncKnowledgeBase } from '../../../../lib/knowledge/sync.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    await requireAdminUser();
    const body = await req.json().catch(() => ({}));
    const mode = body.mode || 'incremental';

    const summary = await syncKnowledgeBase({
      force: mode === 'reindex' || mode === 'reset',
      resetCollection: mode === 'reset',
      cleanupMissing: true,
    });

    return Response.json({ summary, mode });
  } catch (error) {
    if (error.message === 'UNAUTHORIZED') {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.error('Knowledge sync failed:', error);
    return Response.json(
      { message: error.message || 'Knowledge sync failed' },
      { status: 500 }
    );
  }
}
