# Guía de Despliegue en Easypanel

## Paso 1: Preparar el repositorio en GitHub

1. **Crear un repositorio en GitHub:**
   - Ve a https://github.com/new
   - Nombre: `fiscalia-proxy-api` (o el nombre que prefieras)
   - Descripción: "API proxy para Sistema de Gestión de Fiscalías de Ecuador"
   - Visibilidad: **Private** (recomendado por seguridad)
   - Click en "Create repository"

2. **Subir el código al repositorio:**

```bash
# Inicializar git en el proyecto
git init

# Agregar todos los archivos
git add .

# Crear el primer commit
git commit -m "Initial commit: Fiscalia Proxy API with authentication"

# Conectar con tu repositorio de GitHub
git remote add origin https://github.com/TU-USUARIO/fiscalia-proxy-api.git

# Subir el código
git branch -M main
git push -u origin main
```

## Paso 2: Configurar Easypanel

### 2.1 Acceder a Easypanel

1. Accede a tu panel de Easypanel
2. Ve a la sección de **"Projects"** o **"Apps"**

### 2.2 Crear un nuevo servicio

1. Click en **"Create App"** o **"New Service"**
2. Selecciona **"GitHub"** como fuente
3. Autoriza Easypanel para acceder a tus repositorios si aún no lo has hecho
4. Selecciona el repositorio `fiscalia-proxy-api`
5. Selecciona la rama `main`

### 2.3 Configurar el servicio

**Nombre del servicio:**
```
fiscalia-proxy
```

**Build Settings:**
- Build Command: `npm install`
- Start Command: `npm start`
- Root Directory: `/` (deja vacío o pon `/`)

**Port:**
- Easypanel detectará automáticamente el puerto 3000
- O configura manualmente: `3000`

### 2.4 Configurar Variables de Entorno (IMPORTANTE)

En la sección de **Environment Variables**, agrega:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Ambiente de ejecución |
| `API_TOKEN` | `[TU-TOKEN-SECRETO]` | Token de autenticación |

**Para generar un token seguro:**

```bash
# Opción 1: En tu terminal local
openssl rand -hex 32

# Opción 2: Con Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Ejemplo de token generado:**
```
8f4b2c9d7e1a3f6b5c8a2d4e9f1b3c7a2e5b9c4d7f6a3b8e1c4f9d2a5e8b1c4
```

⚠️ **IMPORTANTE:**
- Guarda este token en un lugar seguro
- Lo necesitarás para hacer peticiones a la API
- **NUNCA** lo compartas públicamente ni lo subas a GitHub

### 2.5 Configurar el Dominio

Easypanel te asignará un dominio automáticamente, algo como:
```
https://fiscalia-proxy.easypanel-username.app
```

O puedes configurar un dominio personalizado si tienes uno.

### 2.6 Health Check

Configura el health check endpoint:
- **Path:** `/health`
- **Port:** 3000
- **Interval:** 30s

## Paso 3: Desplegar

1. Click en **"Deploy"** o **"Create"**
2. Easypanel comenzará a:
   - Clonar tu repositorio
   - Ejecutar `npm install`
   - Iniciar el servidor con `npm start`

3. Espera 1-2 minutos mientras se despliega

4. Verifica el estado en los logs de Easypanel

## Paso 4: Verificar el despliegue

### 4.1 Verificar Health Check

```bash
curl https://tu-dominio.easypanel.app/health
```

**Respuesta esperada:**
```json
{"status":"ok","timestamp":"2025-10-30T21:00:00.000Z"}
```

### 4.2 Probar el endpoint con token

```bash
curl -H "X-API-Token: TU_TOKEN_SECRETO" \
  "https://tu-dominio.easypanel.app/api/fiscalia/json?cedula=1717199457"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "status_code": 200,
  "cedula": "1717199457",
  "total_casos": 4,
  "casos": [...]
}
```

### 4.3 Verificar que la autenticación funciona

**Sin token (debe fallar):**
```bash
curl "https://tu-dominio.easypanel.app/api/fiscalia/json?cedula=1717199457"
```

**Respuesta esperada:**
```json
{
  "success": false,
  "status_code": 401,
  "error": "Token de autenticación requerido..."
}
```

## Paso 5: Usar desde tu Frontend

### JavaScript/React/Next.js:

```javascript
// .env.local en tu proyecto frontend
NEXT_PUBLIC_FISCALIA_API_URL=https://tu-dominio.easypanel.app
FISCALIA_API_TOKEN=tu_token_secreto

// En tu código
const consultarFiscalia = async (cedula) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_FISCALIA_API_URL}/api/fiscalia/json?cedula=${cedula}`,
    {
      headers: {
        'X-API-Token': process.env.FISCALIA_API_TOKEN
      }
    }
  );

  return await response.json();
};
```

## Logs y Monitoreo

Para ver los logs en tiempo real en Easypanel:
1. Ve a tu aplicación
2. Click en **"Logs"** o **"Console"**
3. Verás los logs del servidor:

```
[2025-10-30T21:00:00.000Z] Server started successfully
[2025-10-30T21:00:00.000Z] ✓ API protegida con token de autenticación
[2025-10-30T21:00:15.000Z] JSON Endpoint - Cédula: 1717199457
[2025-10-30T21:00:15.500Z] Response received - Status: 200
```

## Redeploy (Actualizar la aplicación)

Cuando hagas cambios en el código:

1. **Commit y push a GitHub:**
```bash
git add .
git commit -m "Descripción de cambios"
git push
```

2. **En Easypanel:**
   - El despliegue automático debería activarse
   - O ve a tu app y click en "Redeploy"

## Troubleshooting

### Error: "API_TOKEN no está configurado"

**Solución:** Verifica que agregaste `API_TOKEN` en las variables de entorno de Easypanel.

### Error: "Cannot find module"

**Solución:**
- Verifica que `package.json` tiene todas las dependencias
- En Easypanel, haz un "Rebuild"

### Error: "Port already in use"

**Solución:** No configures manualmente el PORT en Easypanel. Deja que Easypanel lo configure automáticamente.

### Error: "Application crashed"

**Solución:**
- Revisa los logs en Easypanel
- Verifica que el Start Command sea `npm start`
- Verifica que `package.json` tenga el script "start"

## Configuración Avanzada

### Agregar HTTPS (SSL)

Easypanel maneja HTTPS automáticamente. Solo asegúrate de:
- Usar el dominio proporcionado por Easypanel
- O configurar correctamente tu dominio personalizado

### Configurar Rate Limiting

Si necesitas limitar peticiones, puedes agregar esto en `index.js`:

```javascript
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 peticiones por ventana
});

app.use('/api/', limiter);
```

## Resumen de URLs

Después del despliegue tendrás:

- **Health Check:** `https://tu-dominio.easypanel.app/health`
- **API HTML:** `https://tu-dominio.easypanel.app/api/fiscalia?cedula=XXX&token=YYY`
- **API JSON:** `https://tu-dominio.easypanel.app/api/fiscalia/json?cedula=XXX&token=YYY`
- **Info API:** `https://tu-dominio.easypanel.app/`

---

**¡Listo!** Tu API proxy de Fiscalías de Ecuador está desplegada y protegida con autenticación. 🚀🔒
