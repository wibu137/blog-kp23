import { loadEnvironment } from './lib/load-env.mjs';
import {
  DEFAULT_BATCH_SIZE,
  DEFAULT_CHUNK_OVERLAP,
  DEFAULT_CHUNK_SIZE,
  DEFAULT_ROOT,
  syncKnowledgeBase,
} from '../src/lib/knowledge/sync.mjs';

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function getArg(name, fallback = '') {
  const prefix = `${name}=`;
  const direct = process.argv.find((arg) => arg.startsWith(prefix));
  if (direct) {
    return direct.slice(prefix.length);
  }

  const index = process.argv.indexOf(name);
  if (index !== -1 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }

  return fallback;
}

function printHelp() {
  console.log(`KP23 Knowledge Base Ingest

Usage:
  node scripts/ingest-knowledge-base.mjs [options]

Options:
  --dir <path>              Thu muc knowledge base. Mac dinh: knowledge-base
  --collection <name>       Ghi de CHROMA_COLLECTION_NAME
  --force                   Re-index lai toan bo file local
  --reset                   Xoa collection truoc khi ingest lai
  --keep-missing            Giu lai chunks cua file da bi xoa khoi local
  --dry-run                 Chi quet file, khong goi OpenAI/Chroma
  --chunk-size <number>     So ky tu moi chunk. Mac dinh: 1200
  --chunk-overlap <number>  So ky tu overlap. Mac dinh: 200
  --batch-size <number>     So chunk moi lan goi embedding. Mac dinh: 25
  --help                    Hien tro giup

Folder visibility:
  knowledge-base/public/*          => visibility=public
  knowledge-base/authenticated/*   => visibility=authenticated
  knowledge-base/admin/*           => visibility=admin
  Cac file khac mac dinh => visibility=authenticated`);
}

async function main() {
  await loadEnvironment(process.cwd());

  if (hasFlag('--help')) {
    printHelp();
    return;
  }

  const summary = await syncKnowledgeBase({
    rootDir: getArg('--dir', DEFAULT_ROOT),
    collectionName: getArg('--collection'),
    force: hasFlag('--force'),
    resetCollection: hasFlag('--reset'),
    cleanupMissing: !hasFlag('--keep-missing'),
    dryRun: hasFlag('--dry-run'),
    chunkSize: Number(getArg('--chunk-size', DEFAULT_CHUNK_SIZE)),
    chunkOverlap: Number(getArg('--chunk-overlap', DEFAULT_CHUNK_OVERLAP)),
    batchSize: Number(getArg('--batch-size', DEFAULT_BATCH_SIZE)),
  });

  console.log(
    `Da xu ly ${summary.processed} file | ingest: ${summary.ingested} | bo qua: ${summary.skipped} | removed: ${summary.removed}`
  );

  for (const item of summary.files) {
    console.log(`- ${item.source}: ${item.action}`);
  }

  if (summary.errors.length > 0) {
    console.log('Co loi xay ra:');
    for (const error of summary.errors) {
      console.log(`- ${error.file}: ${error.message}`);
    }
    process.exitCode = 1;
    return;
  }

  if (hasFlag('--dry-run')) {
    console.log('Dry run hoan tat. Khong goi OpenAI hay Chroma.');
  }
}

main().catch((error) => {
  console.error('Ingest that bai:', error);
  process.exitCode = 1;
});
