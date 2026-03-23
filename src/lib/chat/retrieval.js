import { IncludeEnum, getAccessibleVisibilityFilter, getChromaCollection, isChromaConfigured } from './chroma';
import { createEmbeddings } from './openai-embeddings';
import Post from '../models/post.model';
import { DEFAULT_RETRIEVAL_LIMIT } from './constants';
import { stripHtml, truncateWords } from './utils';

async function queryChroma(query, role) {
  if (!isChromaConfigured()) {
    return [];
  }

  const collection = await getChromaCollection();
  const embedding = (await createEmbeddings(query))?.[0] || null;

  if (!embedding || !collection) {
    return [];
  }

  const results = await collection.query({
    queryEmbeddings: [embedding],
    nResults: DEFAULT_RETRIEVAL_LIMIT,
    include: [
      IncludeEnum.documents,
      IncludeEnum.metadatas,
      IncludeEnum.distances,
    ],
    where: getAccessibleVisibilityFilter(role),
  });

  return (results.rows?.()[0] || []).map((item, index) => ({
    title: item.metadata?.title || `Tai lieu ${index + 1}`,
    source: item.metadata?.source || item.uri || 'Chroma KB',
    excerpt: truncateWords(stripHtml(item.document || ''), 80),
    content: stripHtml(item.document || ''),
    score:
      typeof item.distance === 'number'
        ? Number((1 - item.distance).toFixed(4))
        : null,
  }));
}

async function queryLocalPosts(query) {
  const posts = await Post.find({
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } },
    ],
  })
    .sort({ updatedAt: -1 })
    .limit(DEFAULT_RETRIEVAL_LIMIT)
    .lean();

  return posts.map((post) => ({
    title: post.title,
    source: `/post/${post.slug}`,
    excerpt: truncateWords(stripHtml(post.content), 80),
    content: stripHtml(post.content),
    score: null,
  }));
}

export async function retrieveKnowledge(query, role) {
  try {
    const chromaResults = await queryChroma(query, role);
    if (chromaResults.length > 0) {
      return chromaResults;
    }
  } catch (error) {
    console.error('Chroma retrieval failed:', error);
  }

  return queryLocalPosts(query);
}
