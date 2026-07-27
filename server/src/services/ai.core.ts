// =============================================================================
// server/src/services/ai.core.ts
// Reusable AI Gateway Infrastructure
// Wraps Google Generative AI (Gemini 1.5 Flash) with fallback, timeout, & safety.
// =============================================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { logger } from '../config/logger';

let genAIClient: GoogleGenerativeAI | null = null;

if (env.GEMINI_API_KEY) {
  try {
    genAIClient = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    logger.info('✅ Gemini AI SDK initialized successfully');
  } catch (err: unknown) {
    logger.error('Failed to initialize Gemini AI client', { error: (err as Error).message });
  }
} else {
  logger.warn('GEMINI_API_KEY is not configured — AI endpoints will operate in deterministic fallback mode');
}

/**
 * Checks if the Gemini AI service is initialized and available.
 */
export function isAiAvailable(): boolean {
  return Boolean(genAIClient && env.GEMINI_API_KEY);
}

/**
 * Executes a prompt against Gemini AI with strict timeout and fallback handling.
 */
export async function generateAiCompletion(
  prompt: string,
  systemInstruction?: string,
  timeoutMs = 8000
): Promise<string | null> {
  if (!genAIClient || !env.GEMINI_API_KEY) {
    return null;
  }

  try {
    const model = genAIClient.getGenerativeModel({
      model: 'gemini-1.5-flash',
      ...(systemInstruction && { systemInstruction }),
    });

    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        logger.warn('AI Request timed out', { timeoutMs });
        resolve(null);
      }, timeoutMs);
    });

    const aiPromise = (async () => {
      const response = await model.generateContent(prompt);
      const text = response.response.text();
      return text ? text.trim() : null;
    })();

    const result = await Promise.race([aiPromise, timeoutPromise]);
    return result;
  } catch (err: unknown) {
    logger.error('Gemini AI request failed', { error: (err as Error).message });
    return null;
  }
}

/**
 * Executes a prompt against Gemini AI expecting structured JSON output.
 * Safely parses response or returns null to trigger deterministic fallback.
 */
export async function generateAiJson<T = unknown>(
  prompt: string,
  systemInstruction?: string,
  timeoutMs = 8000
): Promise<T | null> {
  const jsonPrompt = `${prompt}\n\nIMPORTANT: Respond ONLY with valid, raw JSON. Do NOT include markdown blocks (\`\`\`json).`;
  const rawText = await generateAiCompletion(jsonPrompt, systemInstruction, timeoutMs);

  if (!rawText) return null;

  try {
    const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as T;
  } catch (err: unknown) {
    logger.error('Failed to parse Gemini AI JSON output', { error: (err as Error).message });
    return null;
  }
}
