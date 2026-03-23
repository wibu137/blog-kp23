const OPENAI_EMBEDDINGS_URL = 'https://api.openai.com/v1/embeddings';

export async function createEmbeddings(input) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY');
  }

  const inputs = Array.isArray(input) ? input : [input];

  if (!inputs.length) {
    return [];
  }

  const response = await fetch(OPENAI_EMBEDDINGS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_EMBED_MODEL || 'text-embedding-3-small',
      input: inputs,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Embedding request failed: ${errorText}`);
  }

  const payload = await response.json();
  return (payload.data || []).map((item) => item.embedding).filter(Boolean);
}
