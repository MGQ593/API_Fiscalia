# Fiscalía Proxy API

API proxy para el sistema de Gestión de Fiscalías de Ecuador. Este servicio actúa como intermediario para realizar consultas al sitio web oficial, evitando restricciones CORS y de firewall.

## Características

- Endpoint proxy para consultas de fiscalía
- Manejo de headers personalizados para evitar bloqueos
- CORS habilitado para llamadas desde frontend
- Health check endpoint para monitoreo
- Timeout configurable (30 segundos por defecto)
- Manejo robusto de errores
- Logs de peticiones
- Listo para desplegar en Easypanel

## Requisitos

- Node.js >= 14.0.0
- npm o yarn

## Instalación

1. Clonar o descargar el proyecto

2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno (IMPORTANTE):

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita el archivo `.env` y configura tu token secreto:

```env
PORT=3000
API_TOKEN=tu_token_secreto_aqui
```

**Generación de token seguro:**

```bash
# Opción 1: Usando openssl
openssl rand -hex 32

# Opción 2: Usando Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Opción 3: Crear tu propio string único
# Ejemplo: fiscalia-ecuador-2024-mi-clave-secreta
```

## Uso

### Ejecutar en desarrollo

```bash
npm start
```

El servidor se iniciará en el puerto 3000 por defecto.

### Variables de entorno

Puedes configurar el puerto usando la variable de entorno `PORT`:

```bash
PORT=8080 npm start
```

## Autenticación

La API utiliza autenticación por token para proteger los endpoints. Todos los endpoints (excepto `/health`) requieren un token válido.

### Formas de enviar el token:

**Opción 1: Header X-API-Token (Recomendado)**
```bash
curl -H "X-API-Token: tu_token_secreto" "http://localhost:3000/api/fiscalia/json?cedula=1717199457"
```

**Opción 2: Authorization Bearer**
```bash
curl -H "Authorization: Bearer tu_token_secreto" "http://localhost:3000/api/fiscalia/json?cedula=1717199457"
```

**Opción 3: Query Parameter**
```bash
curl "http://localhost:3000/api/fiscalia/json?cedula=1717199457&token=tu_token_secreto"
```

### Respuestas de error de autenticación:

**Sin token (401):**
```json
{
  "success": false,
  "status_code": 401,
  "error": "Token de autenticación requerido. Proporciona el token en el header \"X-API-Token\" o como query parameter \"token\""
}
```

**Token inválido (403):**
```json
{
  "success": false,
  "status_code": 403,
  "error": "Token de autenticación inválido"
}
```

## Endpoints

### 1. Health Check

**GET** `/health`

Verifica el estado del servicio.

**Respuesta:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-30T14:00:00.000Z"
}
```

### 2. Consulta de Fiscalía (HTML Crudo)

**GET** `/api/fiscalia?cedula={cedula}`

Realiza una consulta al sistema de Gestión de Fiscalías y retorna el HTML crudo.

**Parámetros:**
- `cedula` (requerido): Número de cédula ecuatoriana (solo dígitos)
- `businfo` (opcional): Alternativa para enviar el formato PHP serializado directamente

**Ejemplo de petición:**
```bash
# Con header X-API-Token
curl -H "X-API-Token: tu_token_secreto" "http://localhost:3000/api/fiscalia?cedula=1717199457"

# O con query parameter
curl "http://localhost:3000/api/fiscalia?cedula=1717199457&token=tu_token_secreto"
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "status_code": 200,
  "html": "<html>...</html>",
  "error": null
}
```

**Respuesta con error:**
```json
{
  "success": false,
  "status_code": 500,
  "html": null,
  "error": "Mensaje de error descriptivo"
}
```

### 3. Consulta de Fiscalía (JSON Estructurado)

**GET** `/api/fiscalia/json?cedula={cedula}`

Realiza una consulta y retorna los datos parseados en formato JSON estructurado.

**Parámetros:**
- `cedula` (requerido): Número de cédula ecuatoriana (solo dígitos)
- `businfo` (opcional): Alternativa para enviar el formato PHP serializado directamente

**Ejemplo de petición:**
```bash
# Con header X-API-Token
curl -H "X-API-Token: tu_token_secreto" "http://localhost:3000/api/fiscalia/json?cedula=1717199457"

# O con query parameter
curl "http://localhost:3000/api/fiscalia/json?cedula=1717199457&token=tu_token_secreto"
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "status_code": 200,
  "cedula": "1717199457",
  "total_casos": 4,
  "casos": [
    {
      "numero_noticia": "090101817125911",
      "lugar": "GUAYAS - GUAYAQUIL",
      "fecha": "2017-12-29",
      "hora": "09:58:57",
      "digitador": "ALFONSO DE LA CRUZ MIRIAM VIRGINIA",
      "estado": "",
      "numero_oficio": "SN-DENUNCIA FORMAL - ORAL",
      "delito": "ESTAFA(3275)",
      "unidad": "FISCALIA DE PATRIMONIO CIUDADANO - EDIFICIO MONTECRISTI - GYE",
      "fiscalia": "FISCALIA 7 DENUNCIA FORMAL - ORAL",
      "sujetos": [
        {
          "cedula": "0910992569",
          "nombres": "GOMEZ GALARZA JEFFERSON ALBERTO",
          "estado": "DENUNCIANTE"
        },
        {
          "cedula": "1717199457",
          "nombres": "GUERRERO QUINTANA MARCO ANDRES",
          "estado": "TESTIGO"
        }
      ]
    }
  ],
  "error": null
}
```

**Respuesta con error:**
```json
{
  "success": false,
  "status_code": 500,
  "data": null,
  "error": "Mensaje de error descriptivo"
}
```

### 4. Información de la API

**GET** `/`

Muestra información sobre la API y sus endpoints disponibles.

## Ejemplo de uso desde JavaScript

### Opción 1: Usando el endpoint JSON (Recomendado)

```javascript
// Usando fetch - Datos estructurados
async function consultarFiscaliaJSON(cedula, apiToken) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/fiscalia/json?cedula=${cedula}`,
      {
        headers: {
          'X-API-Token': apiToken
        }
      }
    );
    const data = await response.json();

    if (data.success) {
      console.log(`Total de casos: ${data.total_casos}`);

      data.casos.forEach((caso, index) => {
        console.log(`\nCaso ${index + 1}:`);
        console.log(`  Número: ${caso.numero_noticia}`);
        console.log(`  Delito: ${caso.delito}`);
        console.log(`  Fecha: ${caso.fecha}`);
        console.log(`  Sujetos: ${caso.sujetos.length}`);

        caso.sujetos.forEach(sujeto => {
          console.log(`    - ${sujeto.nombres} (${sujeto.estado})`);
        });
      });
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Error de red:', error);
  }
}

// Llamar la función
const API_TOKEN = 'tu_token_secreto'; // Mejor guardarlo en variable de entorno
consultarFiscaliaJSON('1717199457', API_TOKEN);
```

### Opción 2: Usando el endpoint HTML

```javascript
// Usando fetch - HTML crudo
async function consultarFiscaliaHTML(cedula) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/fiscalia?cedula=${cedula}`
    );
    const data = await response.json();

    if (data.success) {
      console.log('HTML recibido:', data.html);
      // Puedes parsear el HTML con DOMParser en el navegador
      // o con cheerio en Node.js
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Error de red:', error);
  }
}
```

### Usando axios

```javascript
const axios = require('axios');

async function consultarFiscalia(cedula, apiToken) {
  try {
    // Endpoint JSON estructurado
    const { data } = await axios.get('http://localhost:3000/api/fiscalia/json', {
      params: { cedula: cedula },
      headers: { 'X-API-Token': apiToken }
    });

    if (data.success) {
      console.log('Casos encontrados:', data.total_casos);
      console.log('Datos:', data.casos);
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

## Formato interno

El endpoint convierte automáticamente el número de cédula al formato PHP serializado que requiere el sitio de Fiscalía:

```
Entrada: cedula=1717199457
Formato PHP: a:1:{i:0;s:10:"1717199457";}
URL final: https://www.gestiondefiscalias.gob.ec/siaf/comunes/noticiasdelito/info_mod.php?businfo=a:1:{i:0;s:10:"1717199457";}
```

También puedes enviar el formato PHP serializado directamente usando el parámetro `businfo` si lo necesitas.

## Despliegue en Easypanel

📖 **[Ver Guía Completa de Despliegue](DEPLOY.md)**

La guía completa incluye:
- Paso a paso detallado con capturas
- Configuración de variables de entorno
- Generación de tokens seguros
- Verificación del despliegue
- Troubleshooting

### Resumen rápido:

### Opción 1: Desde GitHub

1. Sube el proyecto a un repositorio de GitHub

2. En Easypanel:
   - Crea un nuevo servicio
   - Selecciona "GitHub" como fuente
   - Conecta tu repositorio
   - Easypanel detectará automáticamente que es un proyecto Node.js
   - El comando de inicio será: `npm start`

3. Variables de entorno (IMPORTANTE):
   - `PORT`: Se configura automáticamente por Easypanel
   - `API_TOKEN`: **OBLIGATORIO** - Configura tu token de autenticación en las variables de entorno de Easypanel

### Opción 2: Deploy directo

1. Comprime el proyecto (sin node_modules)

2. En Easypanel:
   - Crea un nuevo servicio
   - Sube el archivo comprimido
   - Configura el comando de inicio: `npm install && npm start`

### Configuración recomendada en Easypanel

- **Runtime**: Node.js
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Port**: El que Easypanel asigne automáticamente
- **Health Check Path**: `/health`

## Estructura del proyecto

```
fiscalia-proxy/
├── index.js          # Servidor Express principal
├── package.json      # Dependencias y scripts
├── .gitignore       # Archivos ignorados por Git
└── README.md        # Este archivo
```

## Dependencias

- **express**: Framework web para Node.js
- **node-fetch**: Cliente HTTP para realizar peticiones
- **cors**: Middleware para habilitar CORS
- **cheerio**: Parser HTML para extraer datos estructurados
- **dotenv**: Manejo de variables de entorno

## Manejo de errores

La API maneja los siguientes tipos de errores:

- **400**: Parámetro `cedula` no proporcionado o inválido
- **401**: Token de autenticación no proporcionado
- **403**: Token de autenticación inválido
- **404**: Endpoint no encontrado
- **503**: Error de conexión con el servidor de Fiscalía
- **504**: Timeout (más de 30 segundos)
- **500**: Errores internos del servidor

## Logs

El servidor genera logs en la consola con el formato:

```
[2025-10-30T14:00:00.000Z] Fetching: https://www.gestiondefiscalias.gob.ec/...
[2025-10-30T14:00:01.000Z] Response received - Status: 200
```

## Seguridad

- **Autenticación por token**: Todos los endpoints (excepto `/health`) requieren un token API válido
- **Múltiples métodos de autenticación**: Header personalizado, Bearer token, o query parameter
- **Solo peticiones GET**: El proxy únicamente acepta peticiones GET
- **Validación de parámetros**: Se validan todos los parámetros de entrada
- **Timeout configurable**: Implementa timeout de 30 segundos para evitar peticiones colgadas
- **Headers seguros**: Los headers se configuran para simular un navegador legítimo
- **Variables de entorno**: Configuración sensible mediante archivos .env (no versionados)

### Recomendaciones de seguridad:

1. **Nunca compartas tu API_TOKEN públicamente**
2. **No commits el archivo .env** (ya está en .gitignore)
3. **Usa tokens largos y aleatorios** (mínimo 32 caracteres)
4. **Rota el token periódicamente** en producción
5. **Usa HTTPS** cuando despliegues en producción
6. **Configura rate limiting** en tu proxy/gateway si es necesario

## Soporte

Para reportar problemas o sugerencias, crea un issue en el repositorio del proyecto.

## Licencia

MIT
