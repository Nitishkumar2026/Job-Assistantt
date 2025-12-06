import OpenAI from 'openai';

// Initialize OpenAI Client
// We allow passing the key dynamically from the UI for testing purposes
export const getOpenAIClient = (apiKey?: string) => {
  const key = apiKey || import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!key) {
    return null;
  }

  return new OpenAI({
    apiKey: key,
    dangerouslyAllowBrowser: true // Allowed for this client-side demo
  });
};

// Helper to generate random embeddings when API quota is exceeded
// This ensures the demo continues working even without a paid OpenAI account
export const getMockEmbedding = () => {
  // OpenAI text-embedding-3-small returns 1536 dimensions
  return Array.from({ length: 1536 }, () => Math.random() - 0.5);
};

// Generate Embedding for Text (using text-embedding-3-small)
export const generateEmbedding = async (text: string, client: OpenAI) => {
  try {
    const response = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });
    return response.data[0].embedding;
  } catch (error: any) {
    // Handle Quota Exceeded (429) by returning a mock embedding
    if (error?.status === 429 || error?.code === 'insufficient_quota') {
      console.warn("OpenAI Quota Exceeded. Using mock embedding for demo.");
      return getMockEmbedding();
    }
    console.error("Error generating embedding:", error);
    throw error;
  }
};
