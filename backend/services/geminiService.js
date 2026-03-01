import { GoogleGenerativeAI } from '@google/generative-ai';

const MODELS = ['gemini-2.5-flash-preview-04-17', 'gemini-2.0-flash-lite', 'gemini-2.0-flash'];

export async function generateTest(prompt, apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError = null;
  let rateLimitedCount = 0;

  for (const modelName of MODELS) {
    try {
      console.log(`Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      text = text.replace(/```java\n?/g, '').replace(/```\n?/g, '').trim();
      return {
        success: true,
        testCode: text,
        metadata: { generatedAt: new Date().toISOString(), model: modelName }
      };
    } catch (error) {
      lastError = error;
      const msg = error.message || '';
      console.error(`Error with ${modelName}:`, msg);

      if (msg.includes('401') || msg.includes('403') || msg.includes('API_KEY_INVALID') || msg.toLowerCase().includes('api key')) {
        const e = new Error('Invalid API key');
        e.isInvalidKey = true;
        throw e;
      }

      if (msg.includes('429')) {
        rateLimitedCount++;
        continue; // try next model instead of sleeping
      }
    }
  }

  if (rateLimitedCount === MODELS.length) {
    const e = new Error('All models are rate limited. Please wait and try again.');
    e.isRateLimit = true;
    e.retryAfter = 30;
    throw e;
  }

  throw new Error(`Failed to generate test: ${lastError?.message}`);
}
