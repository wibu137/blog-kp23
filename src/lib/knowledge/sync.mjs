import { createHash } from 'node:crypto';
import {
  access,
  mkdir,
  readFile,
  readdir,
  stat,
  unlink,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import { ChromaClient, IncludeEnum } from 'chromadb';

export const SUPPORTED_EXTENSIONS = new Set(['.pdf', '.docx', '.txt']);
export const DEFAULT_ROOT = 'knowledge-base';
export const DEFAULT_CHUNK_SIZE = 1200;
export const DEFAULT_CHUNK_OVERLAP = 200;
export const DEFAULT_BATCH_SIZE = 25;

const OPENAI_EMBEDDINGS_URL = 'https://api.openai.com/v1/embeddings';

function normalizeWhitespace(value = '') {
  return value.replace(/\s+/g, ' ').trim();
}

function createFingerprint(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function isSupportedExtension(filePath = '') {
  return SUPPORTED_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function sanitizeFileName(fileName = 'document.txt') {
  const extension = path.extname(fileName).toLowerCase();
  const baseName = path.basename(fileName, extension);
  const safeBaseName = baseName
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);

  const safeExtension = SUPPORTED_EXTENSIONS.has(extension) ? extension : '.txt';
  return `${safeBaseName || 'document'}${safeExtension}`;
}

function ensureTrailingSlash(value = '') {
  return value.endsWith('/') ? value : `${value}/`;
}

export function getKnowledgeBaseRoot(rootDir = DEFAULT_ROOT) {
  return path.resolve(process.cwd(), rootDir);
}

function resolveKnowledgeSourcePath(rootDir, source) {
  const resolvedPath = path.resolve(rootDir, source);
  const normalizedRoot = `${rootDir}${path.sep}`;

  if (resolvedPath !== rootDir && !resolvedPath.startsWith(normalizedRoot)) {
    throw new Error('Invalid knowledge source path');
  }

  return resolvedPath;
}

export function getVisibility(relativePath = '') {
  const normalized = relativePath.replace(/\\/g, '/');

  if (normalized.startsWith('public/')) {
    return 'public';
  }

  if (normalized.startsWith('admin/')) {
    return 'admin';
  }

  return 'authenticated';
}

export function getChromaCollectionName(collectionName) {
  return collectionName || process.env.CHROMA_COLLECTION_NAME || '';
}

function getChromaHeaders() {
  const apiKey = process.env.CHROMA_API_KEY;
  if (!apiKey) {
    return undefined;
  }

  const customHeader = process.env.CHROMA_AUTH_HEADER;
  if (customHeader) {
    return {
      [customHeader]:
        customHeader.toLowerCase() === 'authorization'
          ? `Bearer ${apiKey}`
          : apiKey,
    };
  }

  return {
    'x-chroma-token': apiKey,
    Authorization: `Bearer ${apiKey}`,
  };
}

export function isChromaConfigured(collectionName) {
  return Boolean(
    getChromaCollectionName(collectionName) &&
      (process.env.CHROMA_PATH ||
        process.env.CHROMA_URL ||
        process.env.CHROMA_HOST)
  );
}

function createChromaClient() {
  const chromaPath = process.env.CHROMA_PATH || process.env.CHROMA_URL;
  const headers = getChromaHeaders();

  if (chromaPath) {
    return new ChromaClient({
      path: chromaPath,
      headers,
      tenant: process.env.CHROMA_TENANT,
      database: process.env.CHROMA_DATABASE,
    });
  }

  return new ChromaClient({
    host: process.env.CHROMA_HOST || 'localhost',
    port: Number(process.env.CHROMA_PORT || 8000),
    ssl: process.env.CHROMA_SSL === 'true',
    headers,
    tenant: process.env.CHROMA_TENANT,
    database: process.env.CHROMA_DATABASE,
  });
}

async function getCollection(collectionName) {
  const resolvedCollectionName = getChromaCollectionName(collectionName);

  if (!resolvedCollectionName) {
    throw new Error('Missing CHROMA_COLLECTION_NAME');
  }

  const client = createChromaClient();
  return client.getOrCreateCollection({
    name: resolvedCollectionName,
  });
}

async function extractTextFromBuffer(buffer, extension) {
  if (extension === '.pdf') {
    const parser = new PDFParse({ data: buffer });

    try {
      const result = await parser.getText();
      return result.text || '';
    } finally {
      await parser.destroy();
    }
  }

  if (extension === '.docx') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  }

  return Buffer.from(buffer).toString('utf8');
}

function splitIntoChunks(text, chunkSize, chunkOverlap) {
  const normalized = normalizeWhitespace(text);
  if (!normalized) {
    return [];
  }

  const chunks = [];
  let start = 0;

  while (start < normalized.length) {
    let end = Math.min(normalized.length, start + chunkSize);

    if (end < normalized.length) {
      const candidateBoundaries = [
        normalized.lastIndexOf('. ', end),
        normalized.lastIndexOf('! ', end),
        normalized.lastIndexOf('? ', end),
        normalized.lastIndexOf('; ', end),
        normalized.lastIndexOf(' ', end),
      ].filter((boundary) => boundary > start + Math.floor(chunkSize * 0.6));

      if (candidateBoundaries.length > 0) {
        end = Math.max(...candidateBoundaries) + 1;
      }
    }

    const chunk = normalized.slice(start, end).trim();
    if (chunk) {
      chunks.push(chunk);
    }

    if (end >= normalized.length) {
      break;
    }

    start = Math.max(end - chunkOverlap, start + 1);
  }

  return chunks;
}

function createChunkId(relativePath, chunkIndex, content) {
  const hash = createHash('sha256')
    .update(relativePath)
    .update(String(chunkIndex))
    .update(content)
    .digest('hex')
    .slice(0, 20);

  return `${relativePath.replace(/[\\/.\s]+/g, '-').toLowerCase()}-${chunkIndex}-${hash}`;
}

function chunkArray(items, batchSize) {
  const batches = [];

  for (let index = 0; index < items.length; index += batchSize) {
    batches.push(items.slice(index, index + batchSize));
  }

  return batches;
}

async function createEmbeddings(texts) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY');
  }

  if (!texts.length) {
    return [];
  }

  const response = await fetch(OPENAI_EMBEDDINGS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small',
      input: texts,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Embedding request failed: ${errorText}`);
  }

  const payload = await response.json();
  return (payload.data || []).map((item) => item.embedding).filter(Boolean);
}

async function walkDirectory(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walkDirectory(fullPath)));
      continue;
    }

    if (isSupportedExtension(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function buildLocalFileInfo(rootDir, filePath) {
  const [buffer, fileStats] = await Promise.all([readFile(filePath), stat(filePath)]);
  const extension = path.extname(filePath).toLowerCase();
  const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');

  return {
    absolutePath: filePath,
    relativePath,
    fileName: path.basename(filePath),
    baseName: path.basename(filePath, extension),
    extension,
    visibility: getVisibility(relativePath),
    size: fileStats.size,
    updatedAt: fileStats.mtime.toISOString(),
    fingerprint: createFingerprint(buffer),
    buffer,
  };
}

async function prepareIngestRecord(rootDir, filePath, chunkSize, chunkOverlap) {
  const localFile = await buildLocalFileInfo(rootDir, filePath);
  const text = await extractTextFromBuffer(localFile.buffer, localFile.extension);
  const chunks = splitIntoChunks(text, chunkSize, chunkOverlap);

  return {
    ...localFile,
    chunks,
  };
}

async function getCollectionSourceIndex(collectionName, includeDocuments = false) {
  if (!isChromaConfigured(collectionName)) {
    return new Map();
  }

  const collection = await getCollection(collectionName);
  const total = await collection.count();
  const pageSize = 200;
  const sourceMap = new Map();

  for (let offset = 0; offset < total; offset += pageSize) {
    const result = await collection.get({
      limit: pageSize,
      offset,
      include: includeDocuments
        ? [IncludeEnum.metadatas, IncludeEnum.documents]
        : [IncludeEnum.metadatas],
    });

    for (const row of result.rows()) {
      const source = row.metadata?.source;
      if (!source) {
        continue;
      }

      const entry = sourceMap.get(source) || {
        source,
        title: row.metadata?.title || path.basename(source),
        visibility: row.metadata?.visibility || 'authenticated',
        extension: row.metadata?.extension || path.extname(source).toLowerCase(),
        fingerprint: row.metadata?.fingerprint || '',
        chunkCount: 0,
        chunks: [],
      };

      entry.chunkCount += 1;

      if (includeDocuments) {
        entry.chunks.push({
          id: row.id,
          content: row.document || '',
          chunkIndex:
            typeof row.metadata?.chunkIndex === 'number'
              ? row.metadata.chunkIndex
              : entry.chunks.length,
        });
      }

      sourceMap.set(source, entry);
    }
  }

  return sourceMap;
}

async function ingestPreparedFile(collection, preparedFile, batchSize) {
  if (!preparedFile.chunks.length) {
    throw new Error('Khong trich xuat duoc noi dung tu tai lieu.');
  }

  await collection.delete({
    where: {
      source: preparedFile.relativePath,
    },
  });

  const chunkPayloads = preparedFile.chunks.map((chunk, index) => ({
    id: createChunkId(preparedFile.relativePath, index, chunk),
    document: chunk,
    metadata: {
      title: preparedFile.baseName,
      source: preparedFile.relativePath,
      fileName: preparedFile.fileName,
      extension: preparedFile.extension,
      visibility: preparedFile.visibility,
      chunkIndex: index,
      chunkCount: preparedFile.chunks.length,
      fingerprint: preparedFile.fingerprint,
      updatedAt: preparedFile.updatedAt,
      size: preparedFile.size,
    },
  }));

  for (const batch of chunkArray(chunkPayloads, batchSize)) {
    const embeddings = await createEmbeddings(batch.map((item) => item.document));

    await collection.upsert({
      ids: batch.map((item) => item.id),
      documents: batch.map((item) => item.document),
      metadatas: batch.map((item) => item.metadata),
      embeddings,
    });
  }
}

export async function saveUploadedKnowledgeFiles(files, options = {}) {
  const rootDir = getKnowledgeBaseRoot(options.rootDir || DEFAULT_ROOT);
  const visibility =
    options.visibility && ['public', 'authenticated', 'admin'].includes(options.visibility)
      ? options.visibility
      : 'authenticated';
  const targetDir = path.join(rootDir, visibility);

  await mkdir(targetDir, { recursive: true });

  const savedFiles = [];

  for (const file of files) {
    if (!(file instanceof File)) {
      continue;
    }

    const safeName = sanitizeFileName(file.name);
    if (!isSupportedExtension(safeName)) {
      continue;
    }

    const targetPath = path.join(targetDir, safeName);
    const arrayBuffer = await file.arrayBuffer();
    await writeFile(targetPath, Buffer.from(arrayBuffer));
    savedFiles.push(targetPath);
  }

  return savedFiles;
}

export async function deleteKnowledgeDocument(source, options = {}) {
  const rootDir = getKnowledgeBaseRoot(options.rootDir || DEFAULT_ROOT);
  const absolutePath = resolveKnowledgeSourcePath(rootDir, source);
  let removedFile = false;
  let removedChroma = false;

  if (options.removeFile !== false) {
    try {
      await unlink(absolutePath);
      removedFile = true;
    } catch {
      removedFile = false;
    }
  }

  if (isChromaConfigured(options.collectionName)) {
    const collection = await getCollection(options.collectionName);
    await collection.delete({
      where: {
        source,
      },
    });
    removedChroma = true;
  }

  return { removedFile, removedChroma };
}

export async function loadKnowledgeChunks(source, options = {}) {
  const collectionName = getChromaCollectionName(options.collectionName);

  if (!isChromaConfigured(collectionName)) {
    return [];
  }

  const collection = await getCollection(collectionName);
  const result = await collection.get({
    where: {
      source,
    },
    include: [IncludeEnum.metadatas, IncludeEnum.documents],
  });

  return result
    .rows()
    .map((row) => ({
      id: row.id,
      content: row.document || '',
      chunkIndex:
        typeof row.metadata?.chunkIndex === 'number' ? row.metadata.chunkIndex : 0,
      chunkCount:
        typeof row.metadata?.chunkCount === 'number' ? row.metadata.chunkCount : null,
    }))
    .sort((left, right) => left.chunkIndex - right.chunkIndex);
}

export async function getKnowledgeDocumentsOverview(options = {}) {
  const rootDir = getKnowledgeBaseRoot(options.rootDir || DEFAULT_ROOT);
  let localFiles = [];

  try {
    await access(rootDir);
    localFiles = await walkDirectory(rootDir);
  } catch {
    localFiles = [];
  }

  const localDocuments = [];
  for (const filePath of localFiles) {
    const localInfo = await buildLocalFileInfo(rootDir, filePath);
    localDocuments.push({
      source: localInfo.relativePath,
      title: localInfo.baseName,
      visibility: localInfo.visibility,
      extension: localInfo.extension,
      size: localInfo.size,
      updatedAt: localInfo.updatedAt,
      fingerprint: localInfo.fingerprint,
      existsOnDisk: true,
      existsInChroma: false,
      chunkCount: 0,
      status: 'pending',
    });
  }

  const localMap = new Map(localDocuments.map((doc) => [doc.source, doc]));
  const remoteMap = await getCollectionSourceIndex(options.collectionName, false);

  for (const [source, remote] of remoteMap.entries()) {
    const local = localMap.get(source);

    if (!local) {
      localMap.set(source, {
        source,
        title: remote.title,
        visibility: remote.visibility,
        extension: remote.extension,
        size: null,
        updatedAt: null,
        fingerprint: remote.fingerprint,
        existsOnDisk: false,
        existsInChroma: true,
        chunkCount: remote.chunkCount,
        status: 'orphaned',
      });
      continue;
    }

    local.existsInChroma = true;
    local.chunkCount = remote.chunkCount;
    local.status = local.fingerprint === remote.fingerprint ? 'synced' : 'changed';
  }

  const documents = Array.from(localMap.values()).sort((left, right) => {
    return String(right.updatedAt || '').localeCompare(String(left.updatedAt || ''));
  });

  const summary = documents.reduce(
    (accumulator, document) => {
      accumulator.total += 1;
      accumulator[document.status] += 1;
      return accumulator;
    },
    {
      total: 0,
      synced: 0,
      changed: 0,
      pending: 0,
      orphaned: 0,
    }
  );

  return {
    documents,
    summary,
    rootDir,
    isChromaConfigured: isChromaConfigured(options.collectionName),
  };
}

export async function syncKnowledgeBase(options = {}) {
  const rootDir = getKnowledgeBaseRoot(options.rootDir || DEFAULT_ROOT);
  const collectionName = getChromaCollectionName(options.collectionName);
  const chunkSize = Number(options.chunkSize || DEFAULT_CHUNK_SIZE);
  const chunkOverlap = Number(options.chunkOverlap || DEFAULT_CHUNK_OVERLAP);
  const batchSize = Number(options.batchSize || DEFAULT_BATCH_SIZE);
  const force = Boolean(options.force);
  const resetCollection = Boolean(options.resetCollection);
  const dryRun = Boolean(options.dryRun);
  const filePaths = Array.isArray(options.filePaths)
    ? options.filePaths.map((filePath) => path.resolve(filePath))
    : null;
  const cleanupMissing =
    options.cleanupMissing === undefined ? !filePaths : Boolean(options.cleanupMissing);

  await access(rootDir);

  const allFiles = await walkDirectory(rootDir);
  const targetFiles = filePaths
    ? allFiles.filter((filePath) => filePaths.includes(path.resolve(filePath)))
    : allFiles;

  const localSources = new Set(
    allFiles.map((filePath) => path.relative(rootDir, filePath).replace(/\\/g, '/'))
  );

  if (!targetFiles.length) {
    return {
      processed: 0,
      ingested: 0,
      skipped: 0,
      removed: 0,
      errors: [],
      files: [],
    };
  }

  if (dryRun) {
    return {
      processed: targetFiles.length,
      ingested: 0,
      skipped: 0,
      removed: 0,
      errors: [],
      files: targetFiles.map((filePath) => ({
        source: path.relative(rootDir, filePath).replace(/\\/g, '/'),
        action: 'dry-run',
      })),
    };
  }

  if (!isChromaConfigured(collectionName)) {
    throw new Error('Chroma is not configured');
  }

  const client = createChromaClient();

  if (resetCollection) {
    try {
      await client.deleteCollection({ name: collectionName });
    } catch {
      // Ignore if the collection does not exist yet.
    }
  }

  const collection = await client.getOrCreateCollection({
    name: collectionName,
    metadata: {
      project: 'KP23 Blog',
      importedFrom: ensureTrailingSlash(
        path.relative(process.cwd(), rootDir).replace(/\\/g, '/')
      ),
    },
  });

  const remoteMap = resetCollection
    ? new Map()
    : await getCollectionSourceIndex(collectionName, false);

  const summary = {
    processed: targetFiles.length,
    ingested: 0,
    skipped: 0,
    removed: 0,
    errors: [],
    files: [],
  };

  for (const filePath of targetFiles) {
    try {
      const preparedFile = await prepareIngestRecord(
        rootDir,
        filePath,
        chunkSize,
        chunkOverlap
      );
      const remote = remoteMap.get(preparedFile.relativePath);

      if (!force && remote?.fingerprint === preparedFile.fingerprint) {
        summary.skipped += 1;
        summary.files.push({
          source: preparedFile.relativePath,
          action: 'skipped',
        });
        continue;
      }

      await ingestPreparedFile(collection, preparedFile, batchSize);
      summary.ingested += 1;
      summary.files.push({
        source: preparedFile.relativePath,
        action: remote ? 'updated' : 'created',
        chunks: preparedFile.chunks.length,
      });
    } catch (error) {
      summary.errors.push({
        file: path.relative(rootDir, filePath).replace(/\\/g, '/'),
        message: error.message || 'Unknown error',
      });
    }
  }

  if (cleanupMissing) {
    for (const [source] of remoteMap.entries()) {
      if (!localSources.has(source)) {
        await collection.delete({
          where: {
            source,
          },
        });
        summary.removed += 1;
        summary.files.push({
          source,
          action: 'removed',
        });
      }
    }
  }

  return summary;
}
