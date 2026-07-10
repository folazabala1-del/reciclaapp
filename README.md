# ReciclIA — Detección y Clasificación de Residuos

App con cámara/foto + IA (Google Gemini, nivel gratuito) que detecta y clasifica residuos
en 10 categorías: battery, biological, cardboard, clothes, glass, metal, paper, plastic,
sanitary waste and toothbrushes, shoes.

## Estructura

```
reciclia-app/
├── public/
│   └── index.html      ← frontend (cámara, UI, dibujo de cajas)
├── server.js            ← backend Express (proxy seguro hacia Gemini)
├── package.json
└── .env.example
```

El **frontend nunca ve tu API key**. Llama a `/api/scan` en tu propio servidor, y es el
servidor (`server.js`) el que llama a Gemini usando la key guardada como variable de
entorno.

## 1. Consigue tu API key de Gemini (gratis, sin tarjeta)

1. Entra a **aistudio.google.com**
2. Inicia sesión con tu cuenta de Google
3. Clic en **"Get API key"** (o **"Crear clave de API"**)
4. Copia la key generada

Esta key usa el **nivel gratuito** de Gemini: no requiere tarjeta de crédito y tiene un
límite generoso (miles de solicitudes al día en el modelo Flash), más que suficiente
para este proyecto.

## 2. Probarlo en tu computadora (opcional, antes de desplegar)

```bash
cd reciclia-app
npm install
cp .env.example .env
# edita .env y pega tu API key real
npm start
```

Abre `http://localhost:3000` en tu navegador.

## 3. Desplegar en Render

1. Sube esta carpeta a un repositorio de **GitHub** (Render despliega desde Git).
2. En Render, click **New +** → **Web Service**.
3. Conecta tu repositorio.
4. Configura:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. En la sección **Environment Variables**, agrega:
   - `GEMINI_API_KEY` = tu key obtenida en aistudio.google.com
6. Click **Create Web Service**. Render te dará una URL pública (algo como
   `https://reciclaapp.onrender.com`) — esa es tu página en producción.

## Notas

- El plan gratuito de Render "duerme" el servicio tras inactividad; el primer request
  después de un rato tarda unos segundos extra en despertar. Es normal.
- La cámara solo funciona en conexiones **HTTPS** (Render la da por defecto) o en
  `localhost`. No funcionará si abres el HTML directamente como archivo local.
- El nivel gratuito de Gemini tiene límites de solicitudes por minuto/día. Si ves un
  error 429, espera un momento y vuelve a intentar — es un límite temporal, no un cobro.
- Google puede usar las imágenes enviadas en el nivel gratuito para mejorar sus modelos.
  Si eso te preocupa (por ejemplo, si vas a subir fotos con datos sensibles), puedes
  habilitar facturación en el proyecto de Google Cloud para pasar al nivel de pago con
  privacidad de datos, aunque para este proyecto de clasificación de residuos no suele
  ser un problema.
