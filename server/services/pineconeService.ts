import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const indexName = process.env.PINECONE_INDEX_NAME || "admin-knowledge-base";

export async function getPineconeIndex() {
  return pinecone.index(indexName);
}

// Generate embeddings using Hugging Face (FREE!)
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(
    "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    }
  );

  if (!response.ok) {
    throw new Error(`Hugging Face API error: ${response.statusText}`);
  }

  const embedding = await response.json();
  return embedding;
}

// Store document chunks in Pinecone
export async function storeDocumentChunks(
  documentId: number,
  chunks: { text: string; index: number }[]
): Promise<void> {
  const index = await getPineconeIndex();

  const vectors = await Promise.all(
    chunks.map(async (chunk) => {
      const embedding = await generateEmbedding(chunk.text);

      return {
        id: `doc-${documentId}-chunk-${chunk.index}`,
        values: embedding,
        metadata: {
          documentId: documentId.toString(),
          chunkIndex: chunk.index,
          text: chunk.text,
        },
      };
    })
  );

  await index.upsert(vectors);
}

// Search for relevant document chunks
export async function searchDocuments(
  query: string,
  topK: number = 5
): Promise<Array<{ text: string; score: number; documentId: string }>> {
  const index = await getPineconeIndex();
  const queryEmbedding = await generateEmbedding(query);

  const results = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  });

  return results.matches.map((match) => ({
    text: match.metadata?.text as string,
    score: match.score || 0,
    documentId: match.metadata?.documentId as string,
  }));
}

// Delete document from Pinecone
export async function deleteDocument(documentId: number): Promise<void> {
  const index = await getPineconeIndex();

  // Delete all chunks for this document
  // Pinecone doesn't support wildcard delete, so we need to query first
  const queryResults = await index.query({
    vector: new Array(1536).fill(0), // dummy vector
    topK: 10000,
    filter: { documentId: documentId.toString() },
    includeMetadata: true,
  });

  const ids = queryResults.matches.map((match) => match.id);

  if (ids.length > 0) {
    await index.deleteMany(ids);
  }
}