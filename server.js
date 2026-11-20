import 'dotenv/config';
import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json({ limit: '20kb' }));
app.use(express.static('public'));

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

// Memoria temporal en servidor para mantener el hilo de la conversación
const conversations = new Map();

const instructions = `
Eres el asistente virtual oficial de CICLOVERDE, un proyecto de emprendimiento sostenible.
Responde siempre en español, con tono amable, claro y profesional.
Información confirmada del proyecto:
- CICLOVERDE transforma residuos orgánicos, principalmente restos de frutas y verduras,
  en módulos biodegradables para plantar que contienen semillas.
- Su propósito es aprovechar residuos, promover el cuidado ambiental y fomentar la economía circular.
- La propuesta busca facilitar el cultivo de plantas y acercar prácticas sostenibles a las personas.
Datos de planeación, no ofertas comerciales confirmadas:
- Se ha manejado un precio estimado de $49 MXN por módulo. Aclara que es una estimación preliminar
  y no confirmes disponibilidad, ventas, envíos, inventario ni precios vigentes.
Reglas:
- No inventes direcciones, teléfonos, redes sociales, certificaciones, instrucciones técnicas,
  tiempos de germinación, garantías ni canales de compra.
- Si no conoces un dato, dilo con honestidad y ofrece canalizar la consulta cuando el equipo
  publique sus medios oficiales.
- No afirmes que el producto tiene certificaciones o impactos cuantificados que no se hayan documentado.
- Contesta la pregunta concreta primero; usa respuestas breves y útiles.
`;

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(ai) });
});

app.post('/api/chat', async (req, res) => {
  try {
    if (!ai) {
      return res.status(503).json({
        error: 'El asistente todavía no está conectado. Falta configurar GEMINI_API_KEY en el servidor.'
      });
    }

    const message = String(req.body?.message || '').trim();
    const previousResponseId = req.body?.previousResponseId;

    if (!message || message.length > 2000) {
      return res.status(400).json({ error: 'Escribe una pregunta de hasta 2,000 caracteres.' });
    }

    // Recupera el historial previo si existe para mantener el contexto
    const history = (typeof previousResponseId === 'string' && conversations.has(previousResponseId))
      ? [...conversations.get(previousResponseId)]
      : [];

    history.push({ role: 'user', parts: [{ text: message }] });

const modelsToTry = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.6-flash', 'gemini-3-flash-preview', 'gemini-3.8-flash'];
    let response;
    let lastError;

    for (const modelName of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: history,
          config: {
            systemInstruction: instructions,
            maxOutputTokens: 500
          }
        });
        break;
      } catch (err) {
        lastError = err;
        const msg = String(err?.message || '');
        if (err?.status !== 503 && err?.status !== 404 && !msg.includes('503') && !msg.includes('404')) {
          throw err;
        await new Promise((r) => setTimeout(r, 1000));  
        }
      }
    }

    if (!response) throw lastError;

    const answer = response.text || 'No pude generar una respuesta. Inténtalo de nuevo.';
    history.push({ role: 'model', parts: [{ text: answer }] });

    // Genera un nuevo ID de sesión y limpia el anterior
    const responseId = `resp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    if (previousResponseId) {
      conversations.delete(previousResponseId);
    }
    conversations.set(responseId, history.slice(-20));

    res.json({ answer, responseId });
  } catch (error) {
    console.error('Chat API error:', error?.message || error);
    res.status(500).json({ error: 'Ocurrió un problema al responder. Inténtalo nuevamente.' });
  }
});

app.listen(port, () => console.log(`CICLOVERDE chatbot activo en http://localhost:${port}`));
