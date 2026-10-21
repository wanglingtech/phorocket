import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env.js';
import { AppError } from '../../common/errors/AppError.js';
import { DEFAULT_MODEL, SUPPORTED_MODELS, type AiCommandInput, type AiVerifyInput } from './ai.schema.js';

function resolveApiKey(userKey?: string): string | undefined {
  const key = userKey?.trim() || env.GEMINI_API_KEY?.trim();
  return key || undefined;
}

function createClient(apiKey: string) {
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'phorocket-api' } },
  });
}

export const aiService = {
  status() {
    const hasServerKey = Boolean(env.GEMINI_API_KEY?.trim());
    return { hasServerKey, defaultModel: DEFAULT_MODEL, supportedModels: SUPPORTED_MODELS };
  },

  async verify(input: AiVerifyInput) {
    const apiKey = resolveApiKey(input.apiKey);
    if (!apiKey) {
      throw AppError.badRequest('No se ha detectado ninguna API Key en la petición ni en el entorno.', {
        code: 'MISSING_API_KEY',
      });
    }
    const model = input.model || DEFAULT_MODEL;
    const ai = createClient(apiKey);
    try {
      const response = await ai.models.generateContent({
        model,
        contents: 'Di brevemente "Phorocket AI Conectada" en 4 palabras.',
      });
      return { valid: true, model, message: response.text?.trim() || 'Conexión verificada exitosamente.' };
    } catch (error: unknown) {
      throw AppError.badRequest(
        (error as Error)?.message || 'Error al conectar con la API de Gemini.',
        { code: 'AI_VERIFY_FAILED' },
      );
    }
  },

  async command(input: AiCommandInput, userKey?: string) {
    const apiKey = resolveApiKey(userKey);
    if (!apiKey) {
      throw AppError.unauthorized(
        'Falta configurar la API Key. Puedes ingresar tu clave de Gemini en los ajustes del asistente.',
        'MISSING_API_KEY',
      );
    }
    const model = input.model || DEFAULT_MODEL;
    const ai = createClient(apiKey);

    const systemInstruction = `Eres "Aura AI", la inteligencia artificial co-piloto de la plataforma musical cyberpunk Phorocket.
Tu objetivo es ayudar al usuario a reproducir canciones, buscar música, cambiar temas visuales, ajustar volumen, reproducir por estado de ánimo o género, y controlar la sesión.

REGLAS DE RESPUESTA:
Debes responder SIEMPRE en formato JSON estricto con la siguiente estructura:
{
  "reply": "Texto en español natural, conciso y con personalidad cyberpunk/futurista explicando lo que hiciste.",
  "action": {
    "type": "PLAY_TRACK" | "SEARCH" | "TOGGLE_PLAY" | "NEXT_TRACK" | "PREV_TRACK" | "SET_VOLUME" | "SET_SHUFFLE" | "SET_REPEAT" | "SET_AMBIENT" | "SET_VISUALIZER" | "CUSTOMIZE_THEME" | "RECOMMEND" | "NONE",
    "trackId": "id de la canción si coincide exactamente con el catálogo",
    "trackTitle": "título de la canción elegida",
    "searchQuery": "término de búsqueda si la acción es SEARCH",
    "volume": número entre 0.0 y 1.0 si es SET_VOLUME,
    "ambientType": "rain" | "static" | "snow" | "thunder" | "embers" | "matrix" si es SET_AMBIENT,
    "visualizerMode": "wave" | "bars" | "spectrum" | "circle" | "d3-cyberpunk" | "particles" si es SET_VISUALIZER,
    "color": "#códigoHex" si es CUSTOMIZE_THEME
  }
}

CATÁLOGO MUSICAL DISPONIBLE EN EL DISPOSITIVO:
${JSON.stringify(input.catalog ?? [], null, 2)}

ESTADO DE REPRODUCCIÓN ACTUAL:
${JSON.stringify(input.playbackState ?? {}, null, 2)}

Si el usuario pide reproducir una canción por nombre o similar (o por género como "synthwave" o estado de ánimo como "para programar"), busca la mejor coincidencia del catálogo y genera la acción PLAY_TRACK con el trackId correspondiente. Si pide subir o bajar el volumen, calcula el nuevo nivel. Si pide pausa o reanudar, usa TOGGLE_PLAY.`;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: input.prompt,
        config: { responseMimeType: 'application/json', systemInstruction },
      });

      const rawText = response.text || '{}';
      let parsedData: unknown;
      try {
        parsedData = JSON.parse(rawText);
      } catch {
        parsedData = { reply: rawText, action: { type: 'NONE' } };
      }
      return { success: true, model, data: parsedData };
    } catch (error: unknown) {
      throw AppError.internal(
        (error as Error)?.message || 'Error interno al procesar el comando de IA.',
        { model },
      );
    }
  },
};
