require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;
const API_TOKEN = process.env.API_TOKEN || null;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración del timeout (30 segundos)
const TIMEOUT = 30000;

// Middleware de autenticación con token
function authenticateToken(req, res, next) {
  // Si no hay API_TOKEN configurado, permitir acceso libre
  if (!API_TOKEN) {
    console.warn('[WARNING] API_TOKEN no está configurado. El API está sin protección.');
    return next();
  }

  // Buscar el token en diferentes lugares
  const token =
    req.headers['x-api-token'] ||  // Header personalizado
    req.headers['authorization']?.replace('Bearer ', '') ||  // Bearer token
    req.query.token;  // Query parameter

  if (!token) {
    return res.status(401).json({
      success: false,
      status_code: 401,
      error: 'Token de autenticación requerido. Proporciona el token en el header "X-API-Token" o como query parameter "token"'
    });
  }

  if (token !== API_TOKEN) {
    return res.status(403).json({
      success: false,
      status_code: 403,
      error: 'Token de autenticación inválido'
    });
  }

  next();
}

// Endpoint de health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Función para generar el formato PHP serializado
function generatePhpSerializedArray(cedula) {
  // Formato: a:1:{i:0;s:LENGTH:"CEDULA";}
  const length = cedula.length;
  return `a:1:{i:0;s:${length}:"${cedula}";}`;
}

// Función para parsear el HTML y extraer datos estructurados
function parseHtmlToJson(html) {
  const $ = cheerio.load(html);
  const casos = [];

  // Buscar todas las tablas de casos (div.general)
  $('div.general').each((index, element) => {
    const caso = {};
    const $tables = $(element).find('table');

    if ($tables.length >= 2) {
      const $mainTable = $tables.eq(0);
      const $subjectsTable = $tables.eq(1);

      // Extraer información del caso
      const $header = $mainTable.find('thead th');
      const headerText = $header.text().trim();
      const matchNumero = headerText.match(/Nro\.\s*(\d+)/);
      caso.numero_noticia = matchNumero ? matchNumero[1] : null;

      // Extraer datos principales
      const $rows = $mainTable.find('tbody tr');
      $rows.each((i, row) => {
        const $cells = $(row).find('td');

        $cells.each((j, cell) => {
          const $cell = $(cell);
          const text = $cell.text().trim();
          const isBold = $cell.attr('style')?.includes('font-weight: bold');

          if (isBold) {
            const label = text.replace(':', '').toLowerCase();
            const $nextCell = $cells.eq(j + 1);

            if ($nextCell.length) {
              const value = $nextCell.text().trim();

              switch(label) {
                case 'lugar':
                  caso.lugar = value;
                  break;
                case 'fecha':
                  caso.fecha = value;
                  break;
                case 'hora':
                  caso.hora = value;
                  break;
                case 'digitador':
                  caso.digitador = value;
                  break;
                case 'estado':
                  caso.estado = value;
                  break;
                case 'nro. oficio':
                  caso.numero_oficio = value;
                  break;
                case 'delito':
                  caso.delito = value;
                  break;
                case 'unidad':
                  caso.unidad = value;
                  break;
                case 'fiscalia':
                  // Extraer solo el texto antes del botón
                  const fiscaliaText = value.split('Este es mi caso')[0].trim();
                  caso.fiscalia = fiscaliaText;
                  break;
              }
            }
          }
        });
      });

      // Extraer sujetos involucrados
      caso.sujetos = [];
      const $subjectRows = $subjectsTable.find('tbody tr');

      $subjectRows.each((i, row) => {
        const $cells = $(row).find('td');

        if ($cells.length >= 3) {
          const sujeto = {
            cedula: $cells.eq(0).text().trim(),
            nombres: $cells.eq(1).text().trim(),
            estado: $cells.eq(2).text().trim()
          };

          caso.sujetos.push(sujeto);
        }
      });

      casos.push(caso);
    }
  });

  return casos;
}

// Endpoint principal del proxy (protegido)
app.get('/api/fiscalia', authenticateToken, async (req, res) => {
  const { cedula, businfo } = req.query;

  // Aceptar tanto 'cedula' como 'businfo' para retrocompatibilidad
  const cedulaValue = cedula || businfo;

  // Validar que el parámetro esté presente
  if (!cedulaValue) {
    return res.status(400).json({
      success: false,
      status_code: 400,
      html: null,
      error: 'El parámetro "cedula" o "businfo" es requerido. Ejemplo: ?cedula=1717199457'
    });
  }

  // Limpiar la cédula (remover espacios y caracteres no numéricos)
  const cedulaClean = cedulaValue.toString().replace(/\D/g, '');

  if (!cedulaClean) {
    return res.status(400).json({
      success: false,
      status_code: 400,
      html: null,
      error: 'La cédula debe contener solo números'
    });
  }

  // Generar el formato PHP serializado
  const phpSerializedValue = generatePhpSerializedArray(cedulaClean);

  // URL del sitio de Gestión de Fiscalías
  const targetUrl = `https://www.gestiondefiscalias.gob.ec/siaf/comunes/noticiasdelito/info_mod.php?businfo=${encodeURIComponent(phpSerializedValue)}`;

  // Headers para simular un navegador real
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'es-ES,es;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://www.gestiondefiscalias.gob.ec/',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Cache-Control': 'max-age=0'
  };

  try {
    console.log(`[${new Date().toISOString()}] Cédula: ${cedulaClean} -> PHP Serialized: ${phpSerializedValue}`);
    console.log(`[${new Date().toISOString()}] Fetching: ${targetUrl}`);

    // Crear controlador de timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, TIMEOUT);

    // Hacer la petición HTTP
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: headers,
      signal: controller.signal
    });

    clearTimeout(timeout);

    // Obtener el HTML
    const html = await response.text();

    console.log(`[${new Date().toISOString()}] Response received - Status: ${response.status}`);

    // Retornar respuesta exitosa
    res.json({
      success: response.ok,
      status_code: response.status,
      html: html,
      error: response.ok ? null : `HTTP ${response.status} - ${response.statusText}`
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error.message);

    // Manejar diferentes tipos de errores
    let errorMessage = error.message;
    let statusCode = 500;

    if (error.name === 'AbortError') {
      errorMessage = 'Timeout: La petición tardó más de 30 segundos';
      statusCode = 504;
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'No se pudo conectar al servidor de Fiscalía';
      statusCode = 503;
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Conexión rechazada por el servidor';
      statusCode = 503;
    }

    res.status(statusCode).json({
      success: false,
      status_code: statusCode,
      html: null,
      error: errorMessage
    });
  }
});

// Endpoint que retorna JSON estructurado (protegido)
app.get('/api/fiscalia/json', authenticateToken, async (req, res) => {
  const { cedula, businfo } = req.query;

  // Aceptar tanto 'cedula' como 'businfo' para retrocompatibilidad
  const cedulaValue = cedula || businfo;

  // Validar que el parámetro esté presente
  if (!cedulaValue) {
    return res.status(400).json({
      success: false,
      status_code: 400,
      data: null,
      error: 'El parámetro "cedula" o "businfo" es requerido. Ejemplo: ?cedula=1717199457'
    });
  }

  // Limpiar la cédula (remover espacios y caracteres no numéricos)
  const cedulaClean = cedulaValue.toString().replace(/\D/g, '');

  if (!cedulaClean) {
    return res.status(400).json({
      success: false,
      status_code: 400,
      data: null,
      error: 'La cédula debe contener solo números'
    });
  }

  // Generar el formato PHP serializado
  const phpSerializedValue = generatePhpSerializedArray(cedulaClean);

  // URL del sitio de Gestión de Fiscalías
  const targetUrl = `https://www.gestiondefiscalias.gob.ec/siaf/comunes/noticiasdelito/info_mod.php?businfo=${encodeURIComponent(phpSerializedValue)}`;

  // Headers para simular un navegador real
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'es-ES,es;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://www.gestiondefiscalias.gob.ec/',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Cache-Control': 'max-age=0'
  };

  try {
    console.log(`[${new Date().toISOString()}] JSON Endpoint - Cédula: ${cedulaClean}`);
    console.log(`[${new Date().toISOString()}] Fetching: ${targetUrl}`);

    // Crear controlador de timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, TIMEOUT);

    // Hacer la petición HTTP
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: headers,
      signal: controller.signal
    });

    clearTimeout(timeout);

    // Obtener el HTML
    const html = await response.text();

    console.log(`[${new Date().toISOString()}] Response received - Status: ${response.status}`);

    if (response.ok) {
      // Parsear el HTML a JSON
      const casos = parseHtmlToJson(html);

      // Retornar respuesta estructurada
      res.json({
        success: true,
        status_code: response.status,
        cedula: cedulaClean,
        total_casos: casos.length,
        casos: casos,
        error: null
      });
    } else {
      res.status(response.status).json({
        success: false,
        status_code: response.status,
        data: null,
        error: `HTTP ${response.status} - ${response.statusText}`
      });
    }

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error.message);

    // Manejar diferentes tipos de errores
    let errorMessage = error.message;
    let statusCode = 500;

    if (error.name === 'AbortError') {
      errorMessage = 'Timeout: La petición tardó más de 30 segundos';
      statusCode = 504;
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'No se pudo conectar al servidor de Fiscalía';
      statusCode = 503;
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Conexión rechazada por el servidor';
      statusCode = 503;
    }

    res.status(statusCode).json({
      success: false,
      status_code: statusCode,
      data: null,
      error: errorMessage
    });
  }
});

// Endpoint raíz con información de la API
app.get('/', (req, res) => {
  res.json({
    name: 'Fiscalía Proxy API',
    version: '1.0.0',
    description: 'API proxy para el sistema de Gestión de Fiscalías de Ecuador',
    endpoints: {
      health: {
        method: 'GET',
        path: '/health',
        description: 'Health check endpoint'
      },
      fiscalia: {
        method: 'GET',
        path: '/api/fiscalia',
        description: 'Proxy endpoint que retorna HTML crudo',
        parameters: {
          cedula: 'Número de cédula ecuatoriana (requerido)',
          businfo: 'Alternativo: formato PHP serializado directo'
        },
        example: '/api/fiscalia?cedula=1717199457',
        response: 'Retorna HTML en formato string'
      },
      fiscaliaJson: {
        method: 'GET',
        path: '/api/fiscalia/json',
        description: 'Endpoint que retorna datos estructurados en JSON',
        parameters: {
          cedula: 'Número de cédula ecuatoriana (requerido)',
          businfo: 'Alternativo: formato PHP serializado directo'
        },
        example: '/api/fiscalia/json?cedula=1717199457',
        response: 'Retorna JSON con casos parseados y estructurados'
      }
    }
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    status_code: 404,
    error: 'Endpoint no encontrado'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  const authStatus = API_TOKEN ? '🔒 Protected (Token Required)' : '⚠️  Open (No Token)';
  console.log(`
╔═══════════════════════════════════════════════════╗
║     Fiscalía Proxy API                           ║
╠═══════════════════════════════════════════════════╣
║  Status: Running                                  ║
║  Port: ${PORT}                                    ║
║  Environment: ${process.env.NODE_ENV || 'development'}                       ║
║  Auth: ${authStatus}                  ║
╠═══════════════════════════════════════════════════╣
║  Endpoints:                                       ║
║  - GET /health (public)                          ║
║  - GET /api/fiscalia?cedula=<cedula> (HTML)      ║
║  - GET /api/fiscalia/json?cedula=<cedula> (JSON) ║
╚═══════════════════════════════════════════════════╝
  `);
  console.log(`[${new Date().toISOString()}] Server started successfully`);

  if (!API_TOKEN) {
    console.warn(`[${new Date().toISOString()}] ⚠️  WARNING: API_TOKEN no configurado. Los endpoints están sin protección.`);
    console.warn(`[${new Date().toISOString()}] ⚠️  Configure API_TOKEN en el archivo .env para proteger el API.`);
  } else {
    console.log(`[${new Date().toISOString()}] ✓ API protegida con token de autenticación`);
  }
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[UNCAUGHT EXCEPTION]', error);
  process.exit(1);
});
