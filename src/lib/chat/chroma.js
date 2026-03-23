import { ChromaClient, IncludeEnum } from 'chromadb';

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

function getChromaClientConfig() {
  const path = process.env.CHROMA_PATH || process.env.CHROMA_URL;
  const headers = getChromaHeaders();

  if (path) {
    return {
      path,
      headers,
      tenant: process.env.CHROMA_TENANT,
      database: process.env.CHROMA_DATABASE,
    };
  }

  return {
    host: process.env.CHROMA_HOST || 'localhost',
    port: Number(process.env.CHROMA_PORT || 8000),
    ssl: process.env.CHROMA_SSL === 'true',
    headers,
    tenant: process.env.CHROMA_TENANT,
    database: process.env.CHROMA_DATABASE,
  };
}

export function isChromaConfigured() {
  return Boolean(
    process.env.CHROMA_COLLECTION_NAME &&
      (process.env.CHROMA_PATH ||
        process.env.CHROMA_URL ||
        process.env.CHROMA_HOST)
  );
}

export function createChromaClient() {
  return new ChromaClient(getChromaClientConfig());
}

export async function getChromaCollection() {
  if (!process.env.CHROMA_COLLECTION_NAME) {
    return null;
  }

  const client = createChromaClient();
  return client.getOrCreateCollection({
    name: process.env.CHROMA_COLLECTION_NAME,
  });
}

export function getAccessibleVisibilityFilter(role) {
  if (role === 'admin') {
    return undefined;
  }

  return {
    visibility: {
      $in: ['public', 'authenticated'],
    },
  };
}

export { IncludeEnum };
