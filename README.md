# ReciclIA — Detección y Clasificación de Residuos

App con cámara/foto + IA (Claude Vision) que detecta y clasifica residuos en 10 categorías:
battery, biological, cardboard, clothes, glass, metal, paper, plastic, sanitary waste and toothbrushes, shoes.

## Estructura

```
reciclia-app/
├── public/
│   └── index.html      ← frontend (cámara, UI, dibujo de cajas)
├── server.js            ← backend Express (proxy seguro hacia Anthropic)
├── package.json
└── .env.example
```

El **frontend nunca ve tu API key**. Llama a `/api/scan` en tu propio servidor, y es el
servidor (`server.js`) el que llama a Anthropic usando la key guardada como variable de
entorno.

## 1. Consigue tu API key de Anthropic

1. Entra a **console.anthropic.com**
2. Crea una cuenta o inicia sesión
3. Ve a **API Keys** → **Create Key**
4. Copia la key (empieza con `sk-ant-...`) — solo la verás una vez

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
5. En la sección **Environment**, agrega la variable:
   - `ANTHROPIC_API_KEY` = tu key de `sk-ant-...`
6. Click **Create Web Service**. Render te dará una URL pública (algo como
   `https://reciclia-app.onrender.com`) — esa es tu página en producción.

## Notas

- El plan gratuito de Render "duerme" el servicio tras inactividad; el primer request
  después de un rato tarda unos segundos extra en despertar. Es normal.
- La cámara solo funciona en conexiones **HTTPS** (Render la da por defecto) o en
  `localhost`. No funcionará si abres el HTML directamente como archivo local.
- Cada escaneo consume créditos de tu cuenta de Anthropic. Revisa precios en
  anthropic.com/pricing si esperas mucho tráfico.
