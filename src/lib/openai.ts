import OpenAI from 'openai';

// Initialize OpenAI Client (Configured for OpenRouter/Gemini)
export const getOpenAIClient = (apiKey?: string) => {
  // Always prefer the env var for the permanent setup
  const key = import.meta.env.VITE_OPENAI_API_KEY || apiKey;
  
  if (!key) {
    return null;
  }

  return new OpenAI({
    apiKey: key,
    baseURL: "https://openrouter.ai/api/v1", // Point to OpenRouter
    dangerouslyAllowBrowser: true,
    defaultHeaders: {
      "HTTP-Referer": window.location.origin, // Required by OpenRouter
      "X-Title": "Job Assistant AI"
    }
  });
};

// Helper to generate random embeddings when API quota is exceeded or model not supported
export const getMockEmbedding = () => {
  return Array.from({ length: 1536 }, () => Math.random() - 0.5);
};

// Generate Embedding
// Note: For OpenRouter, we try to use a compatible embedding model or fallback
export const generateEmbedding = async (text: string, client: OpenAI) => {
  try {
    const response = await client.embeddings.create({
      model: "text-embedding-3-small", // OpenRouter will try to route this or you can use a specific one
      input: text,
      encoding_format: "float",
    });
    return response.data[0].embedding;
  } catch (error: any) {
    // If embedding fails (common with some OpenRouter models), use mock
    console.warn("Embedding generation failed (using mock):", error);
    return getMockEmbedding();
  }
};
