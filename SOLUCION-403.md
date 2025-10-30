# 🔧 Solución al Error 403 desde Easypanel

## 🔍 Problema Identificado:

✅ Tu API funciona **perfectamente**
❌ El sitio de Fiscalía bloquea peticiones desde IPs de datacenter (Easypanel)
✅ Funciona desde tu computadora local (IP residencial)

## 📊 Tests Realizados:

| Origen | Resultado |
|--------|-----------|
| Computadora Local | ✅ 200 OK - Funciona |
| Easypanel (Datacenter) | ❌ 403 Forbidden |

## 🎯 Soluciones Disponibles:

### Opción 1: Ejecutar Localmente (Desarrollo/Testing)

**Ventajas:**
- ✅ Funciona inmediatamente
- ✅ Sin costo adicional
- ✅ Control total

**Desventajas:**
- ❌ Tu computadora debe estar encendida
- ❌ Solo accesible en tu red local

**Cómo usarlo:**

1. En tu computadora, ejecuta:
```bash
cd c:\Proyectos\Fiscalia
API_TOKEN=3ac3d1049184bc7d9c69f3cae9cb9171dcde93d1029fbc992c8c70d867cacd4d node index.js
```

2. Accede desde:
```
http://localhost:3000/api/fiscalia/json?cedula=1717199457
```

3. Para acceso desde internet, usa **ngrok**:
```bash
# Instala ngrok
npm install -g ngrok

# Expone tu servidor local
ngrok http 3000
```

Esto te dará una URL pública tipo: `https://abc123.ngrok.io`

---

### Opción 2: Servicio de Proxy Residencial (Producción)

Usar un servicio que rote IPs residenciales.

**Servicios recomendados:**

#### A) ScraperAPI (Más fácil)
- URL: https://www.scraperapi.com
- Precio: Plan gratuito 1000 requests/mes
- Uso: Solo cambiar la URL

**Implementación:**
```javascript
// En lugar de:
const targetUrl = `https://www.gestiondefiscalias.gob.ec/...`;

// Usar:
const scraperApiKey = 'TU_API_KEY';
const targetUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent('https://www.gestiondefiscalias.gob.ec/...')}`;
```

#### B) Bright Data (Más robusto)
- URL: https://brightdata.com
- Más caro pero más confiable
- IPs ecuatorianas disponibles

#### C) Proxy-cheap (Económico)
- URL: https://proxy-cheap.com
- $5-10/mes
- IPs residenciales

---

### Opción 3: VPS con IP Residencial

Desplegar en un VPS que tenga IP residencial (no de datacenter).

**Servicios:**
- Residential VPS providers
- VPS en Ecuador (mejor geolocalización)

---

### Opción 4: Implementar Delays y Retry (Parcial)

Agregar delays entre peticiones puede ayudar a reducir el bloqueo.

**Código a agregar:**

```javascript
// Antes de hacer la petición
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Agregar delay aleatorio
await delay(Math.random() * 2000 + 1000); // 1-3 segundos
```

---

## 🚀 Recomendación Inmediata:

### Para Desarrollo/Testing:
✅ **Usa ngrok en tu computadora local**

1. Instala ngrok:
```bash
npm install -g ngrok
```

2. En una terminal, ejecuta tu API:
```bash
cd c:\Proyectos\Fiscalia
API_TOKEN=3ac3d1049184bc7d9c69f3cae9cb9171dcde93d1029fbc992c8c70d867cacd4d node index.js
```

3. En otra terminal, ejecuta ngrok:
```bash
ngrok http 3000
```

4. Usa la URL que ngrok te da (ejemplo: `https://abc123.ngrok.io`)

### Para Producción:
✅ **Usa ScraperAPI** (fácil de implementar)

1. Registra en https://www.scraperapi.com
2. Obtén tu API key
3. Modifica el código para usar su proxy
4. Despliega en Easypanel

---

## 💻 Código para ScraperAPI

Si decides usar ScraperAPI, aquí está el código modificado:

### 1. Agregar variable de entorno:
```env
SCRAPER_API_KEY=tu_api_key_aqui
```

### 2. Modificar index.js:

```javascript
// Al inicio del archivo
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY || null;

// En la función del endpoint, cambiar:
let targetUrl;

if (SCRAPER_API_KEY) {
  // Usar ScraperAPI para evitar bloqueo
  const fiscaliaUrl = `https://www.gestiondefiscalias.gob.ec/siaf/comunes/noticiasdelito/info_mod.php?businfo=${encodeURIComponent(phpSerializedValue)}`;
  targetUrl = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(fiscaliaUrl)}`;
  console.log('[ScraperAPI] Using proxy service');
} else {
  // Petición directa (funciona solo desde IPs residenciales)
  targetUrl = `https://www.gestiondefiscalias.gob.ec/siaf/comunes/noticiasdelito/info_mod.php?businfo=${encodeURIComponent(phpSerializedValue)}`;
}
```

---

## 📝 Resumen:

| Solución | Dificultad | Costo | Recomendado para |
|----------|-----------|-------|------------------|
| Local + ngrok | ⭐ Fácil | Gratis | Testing |
| ScraperAPI | ⭐⭐ Media | $0-40/mes | Producción |
| Bright Data | ⭐⭐⭐ Avanzado | $50+/mes | Enterprise |
| VPS Residencial | ⭐⭐⭐ Complejo | $20+/mes | Control total |

---

## ✅ Siguiente Paso:

**¿Qué prefieres?**

1. **Testing rápido:** Usa ngrok en tu computadora
2. **Producción:** Implementa ScraperAPI

Avísame cuál prefieres y te ayudo a implementarlo.
