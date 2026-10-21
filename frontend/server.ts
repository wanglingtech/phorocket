import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Available Gemini models for the user
const SUPPORTED_MODELS = [
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', description: 'Recomendado · Rápido y preciso para comandos de audio' },
  { id: 'gemini-4-argon', name: 'Gemini 4 Argon', description: 'Razonamiento complejo y análisis musical profundo' },
  { id: 'gemini-flash-latest', name: 'Gemini Flash Latest', description: 'Última versión estable de Gemini Flash' }
];

/**
 * GET /api/ai/status
 * Returns current server AI configuration status and available models
 */
app.get('/api/ai/status', (req: Request, res: Response) => {
  const hasServerKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  res.json({
    hasServerKey,
    defaultModel: 'gemini-3.8-flash',
    supportedModels: SUPPORTED_MODELS
  });
});

/**
 * POST /api/ai/verify
 * Tests whether an API key is valid by calling Gemini with a lightweight prompt
 */
app.post('/api/ai/verify', async (req: Request, res: Response) => {
  try {
    const customKey = (req.headers['x-api-key'] || req.headers['x-gemini-api-key'] || req.body.apiKey) as string | undefined;
    const apiKey = customKey || process.env.GEMINI_API_KEY;
    const model = (req.body.model as string) || 'gemini-3.8-flash';

    if (!apiKey) {
      return res.status(400).json({
        valid: false,
        error: 'No se ha detectado ninguna API Key en la petición ni en las variables de entorno.'
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const response = await ai.models.generateContent({
      model,
      contents: 'Di brevemente "Phorocket AI Conectada" en 4 palabras.'
    });

    res.json({
      valid: true,
      model,
      message: response.text?.trim() || 'Conexión verificada exitosamente.'
    });
  } catch (error: any) {
    console.error('Error verifying Gemini API Key:', error);
    res.status(400).json({
      valid: false,
      error: error?.message || 'Error al conectar con la API de Gemini. Verifica la clave ingresada.'
    });
  }
});

/**
 * POST /api/ai/command
 * Interprets natural language commands and music requests
 */
app.post('/api/ai/command', async (req: Request, res: Response) => {
  try {
    const { prompt, catalog, playbackState, model: requestedModel } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'El campo "prompt" es obligatorio.' });
    }

    const customKey = (req.headers['x-api-key'] || req.headers['x-gemini-api-key'] || req.body.apiKey) as string | undefined;
    const apiKey = customKey || process.env.GEMINI_API_KEY;
    const model = requestedModel || 'gemini-3.8-flash';

    if (!apiKey) {
      return res.status(401).json({
        error: 'Falta configurar la API Key. Puedes ingresar tu clave de Gemini en los ajustes del asistente.',
        code: 'MISSING_API_KEY'
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    // Build system instruction providing catalog and player commands
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
${JSON.stringify(catalog || [], null, 2)}

ESTADO DE REPRODUCCIÓN ACTUAL:
${JSON.stringify(playbackState || {}, null, 2)}

Si el usuario pide reproducir una canción por nombre o similar (o por género como "synthwave" o estado de ánimo como "para programar"), busca la mejor coincidencia del catálogo y genera la acción PLAY_TRACK con el trackId correspondiente. Si pide subir o bajar el volumen, calcula el nuevo nivel. Si pide pausa o reanudar, usa TOGGLE_PLAY.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        systemInstruction
      }
    });

    const rawText = response.text || '{}';
    let parsedData: any;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      parsedData = {
        reply: rawText,
        action: { type: 'NONE' }
      };
    }

    res.json({
      success: true,
      model,
      data: parsedData
    });
  } catch (error: any) {
    console.error('Error in /api/ai/command:', error);
    res.status(500).json({
      error: error?.message || 'Error interno al procesar el comando de IA.',
      model: req.body.model || 'gemini-3.8-flash'
    });
  }
});

// Vite Middleware for Development / Static file serving for Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Phorocket Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
