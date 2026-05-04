# MCP Google Analytics (GA4) con OAuth

Este MCP permite consultar datos de Google Analytics 4 (GA4) desde Claude utilizando autenticación OAuth (sin cuenta de servicio).

---

## 📌 Características

- Autenticación mediante OAuth (refresh token)
- Compatible con cuentas personales de Google
- No requiere service account
- Funciona mediante stdio (no necesita servidor web)
- Integración directa con Claude Desktop

---

## 📂 Ubicación del proyecto

```txt
C:\mcp-ga-oauth
```

---

## ⚙️ Requisitos

- Node.js instalado
- Cuenta de Google con acceso a GA4
- OAuth Client ID (tipo Desktop App)
- Refresh Token válido

---

## 🔐 Scope necesario

```txt
https://www.googleapis.com/auth/analytics.readonly
```

---

## 🧩 Variables de entorno

Estas variables deben configurarse en el MCP:

```txt
GA_OAUTH_CLIENT_ID
GA_OAUTH_CLIENT_SECRET
GA_REFRESH_TOKEN
GA_PROPERTY_ID
```

---

## 🏗️ Configuración en Claude (`mcp.json`)

```json
"analytics-mcp": {
  "command": "cmd",
  "args": [
    "/C",
    "node",
    "C:\\mcp-ga-oauth\\index.js"
  ],
  "env": {
    "GA_OAUTH_CLIENT_ID": "TU_CLIENT_ID",
    "GA_OAUTH_CLIENT_SECRET": "TU_CLIENT_SECRET",
    "GA_REFRESH_TOKEN": "TU_REFRESH_TOKEN",
    "GA_PROPERTY_ID": "336940846"
  }
}
```

---

## 🚀 Funciones disponibles

### 1. Snapshot general

```txt
ga4_snapshot
```

Devuelve:
- usuarios activos
- sesiones
- vistas
- sesiones con engagement
- eventos

---

### 2. Páginas más visitadas

```txt
ga4_top_pages
```

Devuelve:
- page path
- título de página
- vistas
- usuarios
- sesiones

---

### 3. Fuentes de tráfico

```txt
ga4_traffic_sources
```

Devuelve:
- source
- medium
- sesiones
- usuarios
- engagement

---

## 🧪 Ejemplos de uso en Claude

```txt
Usá analytics-mcp y ejecutá ga4_snapshot
```

```txt
Mostrame las páginas con más tráfico en los últimos 28 días
```

```txt
Dame las principales fuentes de tráfico
```

---

## 🧪 Test previo (recomendado)

Archivo `test-auth.js`:

```js
import { google } from "googleapis";

const auth = new google.auth.OAuth2(
  process.env.GA_OAUTH_CLIENT_ID,
  process.env.GA_OAUTH_CLIENT_SECRET,
  "http://127.0.0.1:3000/"
);

auth.setCredentials({
  refresh_token: process.env.GA_REFRESH_TOKEN
});

try {
  const token = await auth.getAccessToken();
  console.log("OK: ACCESS TOKEN GENERADO");
} catch (e) {
  console.error(e.response?.data || e.message);
}
```

Ejecutar:

```bash
node test-auth.js
```

---

## ⚠️ Problemas comunes

### ❌ invalid_client

Causa:
- CLIENT_ID o CLIENT_SECRET incorrecto o incompleto

Solución:
- usar exactamente los valores de Google Cloud
- el CLIENT_SECRET debe incluir el prefijo `GOCSPX-`

---

### ❌ invalid_grant

Causa:
- refresh token inválido o vencido

Solución:
- regenerar el token con el mismo CLIENT_ID y CLIENT_SECRET

---

### ❌ Error sin datos

Causa:
- el usuario OAuth no tiene acceso a GA4

Solución:
- verificar permisos en la propiedad de Analytics

---

## 🧠 Notas importantes

- El refresh token depende de:
  CLIENT_ID + CLIENT_SECRET + SCOPE
- Si cambia alguno → hay que regenerar el token
- El mismo token puede reutilizarse si tiene múltiples scopes
- No usar datos de Analytics UI como CLIENT_ID (solo Google Cloud)

---

## 🔥 Recomendación

Combinar este MCP con Search Console para:

- detectar oportunidades SEO
- analizar CTR vs tráfico real
- identificar contenido de alto rendimiento
- tomar decisiones basadas en datos reales

---

## 🧨 Estado

✔ MCP funcionando  
✔ OAuth validado  
✔ Integración con Claude operativa  
✔ Listo para uso productivo
