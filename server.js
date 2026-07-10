const express = require('express');
const path = require('path');

const app = express();
app.use(express.json({ limit: '15mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const WASTE_CLASSES = [
  'battery', 'biological', 'cardboard', 'clothes', 'glass',
  'metal', 'paper', 'plastic', 'sanitary waste and toothbrushes', 'shoes'
];

app.post('/api/scan', async (req, res) => {
  try {
    const { base64, mediaType } = req.body;

    if (!base64 || !mediaType) {
      return res.status(400).json({ error: 'Falta la imagen a analizar.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'El servidor no tiene configurada la variable de entorno GEMINI_API_KEY.' });
    }

    const systemPrompt = `Eres un sistema de visión por computadora especializado en detección de residuos. Analiza la imagen y detecta TODOS los objetos de residuos visibles. Para cada objeto detectado, clasifícalo en EXACTAMENTE una de estas categorías: ${WASTE_CLASSES.join(', ')}.

Responde ÚNICAMENTE con un array JSON válido, sin texto adicional, sin markdown, sin backticks. Formato exacto:
[{"label":"metal","confidence":97,"box":{"x":12.5,"y":30.0,"w":25.0,"h":40.0}}]

Donde x,y son la esquina superior izquierda del cuadro delimitador en PORCENTAJE del ancho/alto de la imagen (0-100), w,h son ancho y alto en porcentaje, y confidence es un entero 0-100. Si no detectas ningún residuo claro, responde con un array vacío [].`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt + '\n\nDetecta y clasifica los residuos en esta imagen.' },
                { inline_data: { mime_type: mediaType, data: base64 } }
              ]
            }
          ]
        })
      }
    );

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      const message = data?.error?.message || 'Error al llamar a la API de Gemini.';
      return res.status(geminiResponse.status).json({ error: message });
    }

    const textBlocks = (data.candidates?.[0]?.content?.parts || [])
      .map(part => part.text || '')
      .join('\n');

    const clean = textBlocks.replace(/```json|```/g, '').trim();

    let detections;
    try {
      detections = JSON.parse(clean);
    } catch (parseErr) {
      return res.status(500).json({ error: 'No se pudo interpretar la respuesta del modelo.' });
    }

    res.json({ detections });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor: ' + err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ReciclIA corriendo en el puerto ${PORT}`);
});
