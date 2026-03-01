import express from 'express';
import { buildPrompt } from '../services/promptBuilder.js';
import { generateTest } from '../services/geminiService.js';

const router = express.Router();

router.post('/generate', async (req, res) => {
  try {
    const { apiKey, code, notes, casePriorities, methodPriorities, classType, annotations, pomInfo } = req.body;

    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      return res.status(400).json({
        success: false,
        error: 'A Gemini API key is required'
      });
    }

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Code is required and must be a non-empty string'
      });
    }

    if (code.length > 50000) {
      return res.status(400).json({
        success: false,
        error: 'Code is too large (max 50,000 characters)'
      });
    }

    const priorities = casePriorities && typeof casePriorities === 'object'
      ? casePriorities
      : { null: 'high', empty: 'medium', boundary: 'medium', exception: 'high', concurrent: 'off' };

    const methodPrios = methodPriorities && typeof methodPriorities === 'object'
      ? methodPriorities
      : {};

    const annotationList = Array.isArray(annotations) ? annotations : [];

    const prompt = buildPrompt(code, notes || '', priorities, methodPrios, classType || 'unknown', pomInfo || null, annotationList);

    const result = await generateTest(prompt, apiKey.trim());
    
    res.json(result);
  } catch (error) {
    console.error('Generation error:', error);
    if (error.isInvalidKey) {
      return res.status(401).json({ success: false, error: 'Invalid API key', invalidKey: true });
    }
    if (error.isRateLimit) {
      return res.status(429).json({ success: false, error: error.message, rateLimited: true, retryAfter: error.retryAfter || 30 });
    }
    res.status(500).json({ success: false, error: error.message || 'Failed to generate test' });
  }
});

export default router;
