import { z } from 'zod';

export const SUPPORTED_MODELS = [
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', description: 'Recomendado · Rápido y preciso para comandos de audio' },
  { id: 'gemini-4-argon', name: 'Gemini 4 Argon', description: 'Razonamiento complejo y análisis musical profundo' },
  { id: 'gemini-flash-latest', name: 'Gemini Flash Latest', description: 'Última versión estable de Gemini Flash' },
] as const;

export const DEFAULT_MODEL = SUPPORTED_MODELS[0].id;

const catalogItemSchema = z.object({
  id: z.string().max(64),
  title: z.string().max(200),
  artist: z.string().max(200).optional(),
  genre: z.string().max(100).optional(),
});

export const aiCommandSchema = z.object({
  prompt: z.string().min(1, 'El prompt es obligatorio').max(2000),
  model: z.string().max(100).optional(),
  catalog: z.array(catalogItemSchema).max(50, 'Máximo 50 pistas de catálogo por petición').optional(),
  playbackState: z.record(z.unknown()).optional(),
});

export const aiVerifySchema = z.object({
  apiKey: z.string().min(10).max(500).optional(),
  model: z.string().max(100).optional(),
});

export type AiCommandInput = z.infer<typeof aiCommandSchema>;
export type AiVerifyInput = z.infer<typeof aiVerifySchema>;
