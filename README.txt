CICLOVERDE - CHATBOT WEB CON IA (GOOGLE GEMINI)
================================================

Este paquete contiene una web de chat y un servidor Node.js que conecta con
la API de Google Gemini (@google/genai).

REQUISITOS
- Node.js 20 o superior
- Una clave gratuita de API de Google Gemini (obtenida en Google AI Studio)
- Conexión a internet

PROBAR EN TU COMPUTADORA
1. Descomprime el ZIP.
2. Abre una terminal dentro de la carpeta CICLOVERDE_Chatbot_IA.
3. Ejecuta: npm install
4. Copia .env.example y nombra la copia .env
5. Abre .env y coloca tu clave después de GEMINI_API_KEY=
6. Ejecuta: npm start
7. Abre http://localhost:3000

IMPORTANTE SOBRE LA CLAVE
- No pongas la clave en public/index.html.
- No compartas el archivo .env ni lo subas a GitHub.
- Nunca pegues tu clave API en este chat.

PUBLICAR EN INTERNET
Sube el proyecto a un proveedor que ejecute Node.js (por ejemplo Render,
Railway o un servidor propio). Configura la variable de entorno
GEMINI_API_KEY en el panel privado del proveedor y usa el comando de inicio
npm start. Después conecta un dominio si lo deseas.

PERSONALIZACIÓN
El mensaje de sistema y los datos conocidos de CICLOVERDE están en server.js,
en la constante "instructions". Revisa y actualiza allí datos de producto,
precios, ventas y contacto antes de publicarlo.
