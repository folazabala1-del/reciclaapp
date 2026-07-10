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

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'El servidor no tiene configurada la variable de entorno ANTHROPIC_API_KEY.' });
    }

    const systemPrompt = `Eres un sistema de visión por computadora especializado en detección de residuos. Analiza la imagen y detecta TODOS los objetos de residuos visibles. Para cada objeto detectado, clasifícalo en EXACTAMENTE una de estas categorías: ${WASTE_CLASSES.join(', ')}.

Responde ÚNICAMENTE con un array JSON válido, sin texto adicional, sin markdown, sin backticks. Formato exacto:
[{"label":"metal","confidence":97,"box":{"x":12.5,"y":30.0,"w":25.0,"h":40.0}}]

Donde x,y son la esquina superior izquierda del cuadro delimitador en PORCENTAJE del ancho/alto de la imagen (0-100), w,h son ancho y alto en porcentaje, y confidence es un entero 0-100. Si no detectas ningún residuo claro, responde con un array vacío [].`;

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
              { type: 'text', text: 'Detecta y clasifica los residuos en esta imagen.' }
            ]
          }
        ]
      })
    });

    const data = await anthropicResponse.json();

    if (!anthropicResponse.ok) {
      const message = data?.error?.message || 'Error al llamar a la API de Anthropic.';
      return res.status(anthropicResponse.status).json({ error: message });
    }

    const textBlocks = (data.content || [])
      .filter(block => block.type === 'text')
      .map(block => block.text)
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
