# AI Assistant Setup

Route: `/assistant`

## Environment variables

```env
OPENAI_API_KEY=sk-...
OPENAI_CHAT_MODEL=gpt-4.1-mini
OPENAI_EMBED_MODEL=text-embedding-3-small
CHROMA_URL=http://localhost:8000
CHROMA_COLLECTION_NAME=kp23-blog-kb
CHROMA_TENANT=default_tenant
CHROMA_DATABASE=default_database
CHROMA_API_KEY=
CHROMA_AUTH_HEADER=
```

## Behavior

- Requires Clerk login.
- Stores conversation history in MongoDB.
- Keeps short-term memory per conversation and long-term memory per user profile.
- Streams responses from OpenAI.
- Retrieves knowledge from Chroma first.
- Falls back to blog posts in MongoDB when Chroma is unavailable.
- Refuses to answer beyond the provided knowledge base.

## Ingest files into Chroma

Dat file vao [knowledge-base](d:/blog-kp23/knowledge-base):

- [public](d:/blog-kp23/knowledge-base/public): everyone
- [authenticated](d:/blog-kp23/knowledge-base/authenticated): signed-in users
- [admin](d:/blog-kp23/knowledge-base/admin): admins only

Run:

```bash
node scripts/ingest-knowledge-base.mjs --dry-run
npm run sync:kb
npm run reindex:kb
```

Dashboard admin:

- `/dashboard?tab=knowledge`: upload tai lieu, xem documents/chunks, sync incremental, re-index va xoa tai lieu.
