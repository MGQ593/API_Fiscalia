# ✅ Checklist de Despliegue - Fiscalía Proxy API

## Antes de empezar

- [ ] Tienes una cuenta en GitHub
- [ ] Tienes acceso a Easypanel
- [ ] Has instalado Git en tu computadora
- [ ] Has probado el API localmente

## Paso 1: Preparar GitHub

- [ ] Crear repositorio en GitHub (nombre sugerido: `fiscalia-proxy-api`)
- [ ] Marcar como **Private** para seguridad
- [ ] NO inicializar con README (ya tienes uno)

## Paso 2: Subir código a GitHub

Ejecuta estos comandos en orden (desde la carpeta del proyecto):

```bash
# 1. Inicializar Git
git init

# 2. Agregar archivos
git add .

# 3. Crear commit
git commit -m "Initial commit: Fiscalia Proxy API"

# 4. Conectar con GitHub (REEMPLAZA TU-USUARIO)
git remote add origin https://github.com/TU-USUARIO/fiscalia-proxy-api.git

# 5. Subir código
git branch -M main
git push -u origin main
```

**Checklist:**
- [ ] Ejecuté `git init`
- [ ] Ejecuté `git add .`
- [ ] Ejecuté `git commit -m "..."`
- [ ] Reemplacé TU-USUARIO con mi usuario de GitHub
- [ ] Ejecuté `git push -u origin main`
- [ ] Verifiqué que el código está en GitHub

## Paso 3: Generar Token Seguro

Ejecuta UNO de estos comandos:

```bash
# Opción 1: OpenSSL
openssl rand -hex 32

# Opción 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Checklist:**
- [ ] Generé un token aleatorio de 32+ caracteres
- [ ] Copié el token a un lugar seguro (bloc de notas)
- [ ] El token NO está en el código ni en GitHub

**Mi token:** (escríbelo aquí temporalmente, luego borra este archivo)
```
_______________________________________
```

## Paso 4: Configurar Easypanel

### 4.1 Crear App

- [ ] Entré a mi panel de Easypanel
- [ ] Click en "Create App" o "New Service"
- [ ] Seleccioné "GitHub" como fuente
- [ ] Autoricé Easypanel para acceder a mis repos
- [ ] Seleccioné el repo `fiscalia-proxy-api`
- [ ] Seleccioné la rama `main`

### 4.2 Configuración Básica

**Nombre del servicio:**
- [ ] Ingresé: `fiscalia-proxy`

**Build Settings:**
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Root Directory: `/` (o dejar vacío)

**Port:**
- [ ] Puerto: `3000` (o detectado automáticamente)

### 4.3 Variables de Entorno (CRÍTICO)

- [ ] Agregué variable `NODE_ENV` = `production`
- [ ] Agregué variable `API_TOKEN` = `[MI-TOKEN-GENERADO]`
- [ ] Verifiqué que el token sea el correcto

### 4.4 Health Check

- [ ] Path: `/health`
- [ ] Port: `3000`
- [ ] Interval: `30s`

### 4.5 Deploy

- [ ] Click en "Deploy" o "Create"
- [ ] Esperé 1-2 minutos
- [ ] El status muestra "Running" o "Healthy"

## Paso 5: Verificar Despliegue

**Mi URL de Easypanel:** (escribe tu URL aquí)
```
https://__________________________________.easypanel.app
```

### 5.1 Test Health Check

```bash
curl https://TU-URL.easypanel.app/health
```

**Checklist:**
- [ ] El comando funcionó
- [ ] Respuesta: `{"status":"ok","timestamp":"..."}`

### 5.2 Test sin Token (debe fallar)

```bash
curl https://TU-URL.easypanel.app/api/fiscalia/json?cedula=1717199457
```

**Checklist:**
- [ ] El comando funcionó
- [ ] Respuesta: `{"success":false,"status_code":401,...}`
- [ ] Mensaje de error sobre token requerido

### 5.3 Test con Token (debe funcionar)

```bash
curl -H "X-API-Token: TU-TOKEN-AQUI" \
  "https://TU-URL.easypanel.app/api/fiscalia/json?cedula=1717199457"
```

**Checklist:**
- [ ] Reemplacé `TU-TOKEN-AQUI` con mi token real
- [ ] Reemplacé `TU-URL` con mi URL de Easypanel
- [ ] El comando funcionó
- [ ] Respuesta: `{"success":true,"total_casos":4,...}`
- [ ] Recibí datos de casos de fiscalía

## Paso 6: Guardar Información

**Información a guardar en lugar seguro:**

```
PROYECTO: Fiscalía Proxy API
URL: https://__________________________________.easypanel.app
API TOKEN: _______________________________________________
GITHUB REPO: https://github.com/____________/fiscalia-proxy-api

ENDPOINTS:
- Health: https://TU-URL.easypanel.app/health
- API HTML: https://TU-URL.easypanel.app/api/fiscalia?cedula=XXX
- API JSON: https://TU-URL.easypanel.app/api/fiscalia/json?cedula=XXX

USO:
curl -H "X-API-Token: MI-TOKEN" "https://TU-URL.easypanel.app/api/fiscalia/json?cedula=1717199457"
```

**Checklist:**
- [ ] Guardé la URL de mi API
- [ ] Guardé mi API_TOKEN de forma segura
- [ ] Guardé la URL de GitHub
- [ ] Guardé ejemplos de uso con mi URL y token

## ✅ Despliegue Completado

Si todos los checkboxes están marcados, ¡tu API está desplegada y funcionando!

## Próximos Pasos

### Para usar desde tu Frontend:

```javascript
// .env.local
NEXT_PUBLIC_FISCALIA_API_URL=https://tu-url.easypanel.app
FISCALIA_API_TOKEN=tu-token-secreto

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

### Para hacer cambios en el futuro:

```bash
# 1. Hacer cambios en el código
# 2. Commit
git add .
git commit -m "Descripción del cambio"

# 3. Push
git push

# 4. Easypanel hará redeploy automático
```

## Ayuda

- **Problemas con GitHub:** Ver [DEPLOY.md](DEPLOY.md) sección Troubleshooting
- **Problemas con Easypanel:** Revisar logs en Easypanel → Tu App → Logs
- **API no responde:** Verificar que `API_TOKEN` esté configurado en Easypanel

---

**¡Felicidades! 🎉 Tu API proxy de Fiscalías está en producción y protegida.**
