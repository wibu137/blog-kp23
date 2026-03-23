# Knowledge Base

Dat tai lieu nguon vao day de ingest len Chroma.

## Folder structure

- `knowledge-base/public/`: user nao cung duoc truy cap
- `knowledge-base/authenticated/`: chi user da dang nhap
- `knowledge-base/admin/`: chi admin

## Supported formats

- `.pdf`
- `.docx`
- `.txt`

## Ingest

```bash
node scripts/ingest-knowledge-base.mjs --dry-run
node scripts/ingest-knowledge-base.mjs --reset
npm run sync:kb
npm run reindex:kb
```

Luu y:

- Neu tai lieu nhay cam, can nhac khong commit len git.
- Script se chunk noi dung, tao OpenAI embeddings, va upsert vao Chroma.
