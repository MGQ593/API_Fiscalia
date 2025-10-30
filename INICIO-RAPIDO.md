# 🚀 Inicio Rápido - Despliegue en 5 minutos

## Archivos del Proyecto

```
fiscalia-proxy/
├── 📄 index.js                 # Servidor principal
├── 📄 package.json             # Dependencias
├── 📄 .env                     # Variables de entorno (NO SUBIR A GITHUB)
├── 📄 .env.example             # Plantilla de variables
├── 📄 .gitignore              # Archivos a ignorar
├── 📄 README.md               # Documentación completa
├── 📄 DEPLOY.md               # Guía detallada de despliegue
├── 📄 CHECKLIST-DEPLOY.md     # Checklist paso a paso
└── 📄 git-commands.txt        # Comandos Git útiles
```

## Despliegue Rápido (5 pasos)

### 1️⃣ Generar Token (30 segundos)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Copia el resultado** → Este es tu `API_TOKEN`

### 2️⃣ Crear Repo en GitHub (1 minuto)

1. Ve a https://github.com/new
2. Nombre: `fiscalia-proxy-api`
3. Visibilidad: **Private**
4. Click "Create repository"

### 3️⃣ Subir Código (1 minuto)

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU-USUARIO/fiscalia-proxy-api.git
git branch -M main
git push -u origin main
```

### 4️⃣ Configurar en Easypanel (2 minutos)

1. **Easypanel** → "Create App" → "GitHub"
2. Selecciona tu repo `fiscalia-proxy-api`
3. **Variables de entorno:**
   - `NODE_ENV` = `production`
   - `API_TOKEN` = `[tu-token-del-paso-1]`
4. Click "Deploy"

### 5️⃣ Verificar (30 segundos)

```bash
# Cambiar TU-URL por tu URL de Easypanel
curl https://TU-URL.easypanel.app/health

# Debe responder: {"status":"ok","timestamp":"..."}
```

## ✅ ¡Listo! Tu API está desplegada

### Usar la API:

```bash
curl -H "X-API-Token: TU-TOKEN" \
  "https://TU-URL.easypanel.app/api/fiscalia/json?cedula=1717199457"
```

### Desde JavaScript:

```javascript
const response = await fetch(
  'https://TU-URL.easypanel.app/api/fiscalia/json?cedula=1717199457',
  {
    headers: { 'X-API-Token': 'TU-TOKEN' }
  }
);
const data = await response.json();
console.log(data.casos); // Array de casos
```

## 📚 Documentación Completa

- **README.md** → Documentación de la API
- **DEPLOY.md** → Guía detallada de despliegue
- **CHECKLIST-DEPLOY.md** → Checklist interactivo

## ⚠️ Importante

1. ✅ El archivo `.env` NO se sube a GitHub (está en .gitignore)
2. ✅ Guarda tu `API_TOKEN` en lugar seguro
3. ✅ Nunca compartas tu token públicamente
4. ✅ Usa HTTPS en producción (Easypanel lo maneja automáticamente)

## 🆘 Ayuda

**Problema:** "401 Unauthorized"
- **Solución:** Verifica que estés enviando el header `X-API-Token` con el token correcto

**Problema:** "API_TOKEN no configurado"
- **Solución:** Agrega `API_TOKEN` en las variables de entorno de Easypanel

**Problema:** "Cannot find module"
- **Solución:** En Easypanel, haz "Rebuild" para reinstalar dependencias

---

**¿Necesitas más ayuda?** Revisa [DEPLOY.md](DEPLOY.md) para guía completa con troubleshooting.
