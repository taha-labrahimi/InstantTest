import { GoogleGenerativeAI } from '@google/generative-ai';

const MODELS = ['gemini-2.5-flash-preview-04-17', 'gemini-2.0-flash-lite', 'gemini-2.0-flash'];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generateTest(prompt, apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError = null;

  for (const modelName of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`Trying model: ${modelName} (attempt ${attempt + 1})`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        text = text.replace(/```java\n?/g, '').replace(/```\n?/g, '').trim();

        return {
          success: true,
          testCode: text,
          metadata: {
            generatedAt: new Date().toISOString(),
            model: modelName
          }
        };
      } catch (error) {
        lastError = error;
        console.error(`Error with ${modelName} (attempt ${attempt + 1}):`, error.message);

        if (error.message?.includes('429') && attempt === 0) {
          console.log('Rate limited, waiting 35 seconds before retry...');
          await sleep(35000);
          continue;
        }
        break;
      }
    }
  }

  throw new Error(`Failed to generate test: ${lastError?.message}`);
}
