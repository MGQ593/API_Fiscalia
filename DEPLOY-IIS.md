# 🖥️ Despliegue en IIS (Internet Information Services)

## Requisitos Previos:

- ✅ Windows Server o Windows 10/11 Pro
- ✅ IIS instalado
- ✅ Node.js instalado en el servidor
- ✅ iisnode instalado (para ejecutar Node.js en IIS)

---

## 📦 Paso 1: Instalar Requisitos en el Servidor IIS

### 1.1 Instalar Node.js

Si aún no está instalado:

1. Descarga Node.js desde: https://nodejs.org/
2. Instala la versión LTS (Long Term Support)
3. Verifica la instalación:
```cmd
node --version
npm --version
```

### 1.2 Instalar iisnode

**iisnode** permite ejecutar aplicaciones Node.js en IIS.

1. Descarga desde: https://github.com/Azure/iisnode/releases
2. Descarga el archivo `.msi` apropiado:
   - Para 64-bit: `iisnode-full-v0.2.26-x64.msi`
3. Ejecuta el instalador
4. Reinicia IIS:
```cmd
iisreset
```

### 1.3 Instalar URL Rewrite Module

1. Descarga desde: https://www.iis.net/downloads/microsoft/url-rewrite
2. Instala el módulo
3. Reinicia IIS

---

## 📁 Paso 2: Preparar el Proyecto

### 2.1 Copiar archivos al servidor

Copia toda la carpeta del proyecto a tu servidor IIS:

**Ejemplo:**
```
C:\inetpub\wwwroot\api_fiscalia\
```

O a cualquier otra ubicación que prefieras.

### 2.2 Instalar dependencias

Abre PowerShell o CMD en el directorio del proyecto:

```cmd
cd C:\inetpub\wwwroot\api_fiscalia
npm install --production
```

### 2.3 Crear archivo .env

Crea el archivo `.env` en la carpeta del proyecto:

```env
PORT=3000
API_TOKEN=3ac3d1049184bc7d9c69f3cae9cb9171dcde93d1029fbc992c8c70d867cacd4d
NODE_ENV=production
```

---

## ⚙️ Paso 3: Configurar IIS

### 3.1 Crear archivo web.config

En la raíz del proyecto, crea un archivo llamado `web.config`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>

    <!-- Indicar que es una aplicación Node.js -->
    <handlers>
      <add name="iisnode" path="index.js" verb="*" modules="iisnode" />
    </handlers>

    <!-- Reglas de reescritura -->
    <rewrite>
      <rules>
        <!-- No reescribir archivos estáticos -->
        <rule name="StaticContent">
          <action type="Rewrite" url="public{REQUEST_URI}"/>
        </rule>

        <!-- Todas las demás peticiones van a index.js -->
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="index.js"/>
        </rule>
      </rules>
    </rewrite>

    <!-- Configuración de iisnode -->
    <iisnode
      node_env="production"
      nodeProcessCountPerApplication="1"
      maxConcurrentRequestsPerProcess="1024"
      maxNamedPipeConnectionRetry="100"
      namedPipeConnectionRetryDelay="250"
      maxNamedPipeConnectionPoolSize="512"
      maxNamedPipePooledConnectionAge="30000"
      asyncCompletionThreadCount="0"
      initialRequestBufferSize="4096"
      maxRequestBufferSize="65536"
      watchedFiles="*.js;iisnode.yml"
      uncFileChangesPollingInterval="5000"
      gracefulShutdownTimeout="60000"
      loggingEnabled="true"
      logDirectory="iisnode"
      debuggingEnabled="false"
      debugHeaderEnabled="false"
      debuggerPortRange="5058-6058"
      debuggerPathSegment="debug"
      maxLogFileSizeInKB="128"
      maxTotalLogFileSizeInKB="1024"
      maxLogFiles="20"
      devErrorsEnabled="false"
      flushResponse="false"
      enableXFF="false"
      promoteServerVars=""
      configOverrides="iisnode.yml"
    />

    <!-- Errores personalizados -->
    <httpErrors existingResponse="PassThrough" />

    <!-- Seguridad -->
    <security>
      <requestFiltering>
        <hiddenSegments>
          <add segment="node_modules" />
          <add segment=".env" />
          <add segment=".git" />
        </hiddenSegments>
      </requestFiltering>
    </security>

  </system.webServer>
</configuration>
```

### 3.2 Crear sitio en IIS

**Opción A: Interfaz Gráfica**

1. Abre **Administrador de IIS** (Internet Information Services Manager)
2. Click derecho en **"Sitios"** → **"Agregar sitio web"**
3. Configurar:
   ```
   Nombre del sitio: API_Fiscalia
   Ruta física: C:\inetpub\wwwroot\api_fiscalia
   Tipo: http
   Dirección IP: Todas sin asignar (o una específica)
   Puerto: 8080 (o el que prefieras)
   Nombre de host: (dejar vacío o poner api-fiscalia.local)
   ```
4. Click en **"Aceptar"**

**Opción B: PowerShell**

```powershell
# Importar módulo IIS
Import-Module WebAdministration

# Crear Application Pool
New-WebAppPool -Name "API_Fiscalia_Pool"
Set-ItemProperty IIS:\AppPools\API_Fiscalia_Pool -name "managedRuntimeVersion" -value ""

# Crear Sitio
New-Website -Name "API_Fiscalia" `
            -Port 8080 `
            -PhysicalPath "C:\inetpub\wwwroot\api_fiscalia" `
            -ApplicationPool "API_Fiscalia_Pool"
```

### 3.3 Configurar Permisos

El Application Pool necesita permisos de lectura en la carpeta:

```powershell
# Dar permisos al usuario del Application Pool
$acl = Get-Acl "C:\inetpub\wwwroot\api_fiscalia"
$permission = "IIS AppPool\API_Fiscalia_Pool","Read,ReadAndExecute","ContainerInherit,ObjectInherit","None","Allow"
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission
$acl.SetAccessRule($accessRule)
Set-Acl "C:\inetpub\wwwroot\api_fiscalia" $acl
```

---

## 🧪 Paso 4: Probar

### 4.1 Verificar que el sitio está corriendo

En el navegador del servidor:

```
http://localhost:8080/health
```

Deberías ver:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

### 4.2 Probar el endpoint con token

```
http://localhost:8080/api/fiscalia/json?cedula=1717199457&token=3ac3d1049184bc7d9c69f3cae9cb9171dcde93d1029fbc992c8c70d867cacd4d
```

### 4.3 Desde otra máquina en la red

```
http://IP-DEL-SERVIDOR:8080/health
```

Reemplaza `IP-DEL-SERVIDOR` con la IP local de tu servidor.

---

## 🌐 Paso 5: Configurar Firewall

### 5.1 Abrir puerto en Windows Firewall

```powershell
# Abrir puerto 8080
New-NetFirewallRule -DisplayName "API Fiscalia" `
                     -Direction Inbound `
                     -LocalPort 8080 `
                     -Protocol TCP `
                     -Action Allow
```

O manualmente:
1. Abrir **Windows Defender Firewall**
2. Click en **"Configuración avanzada"**
3. Click en **"Reglas de entrada"** → **"Nueva regla"**
4. Tipo: **Puerto**
5. Puerto TCP específico: **8080**
6. Permitir la conexión
7. Nombre: **API Fiscalia**

---

## 🔒 Paso 6: SSL/HTTPS (Opcional pero recomendado)

### 6.1 Generar certificado autofirmado (para desarrollo)

```powershell
New-SelfSignedCertificate -DnsName "api-fiscalia.local" `
                          -CertStoreLocation "cert:\LocalMachine\My" `
                          -NotAfter (Get-Date).AddYears(2)
```

### 6.2 Configurar enlace HTTPS en IIS

1. En IIS Manager, selecciona tu sitio
2. Click en **"Enlaces"** (Bindings)
3. Click en **"Agregar"**
4. Tipo: **https**
5. Puerto: **443** (o 8443)
6. Certificado SSL: Selecciona el que creaste
7. Click en **"Aceptar"**

---

## 📊 Paso 7: Monitoreo y Logs

### 7.1 Ver logs de iisnode

Los logs se guardan en:
```
C:\inetpub\wwwroot\api_fiscalia\iisnode\
```

### 7.2 Ver logs de la aplicación

Los logs de tu aplicación (console.log) aparecen en los archivos de iisnode.

### 7.3 Monitoreo en tiempo real

Usa **Process Explorer** o **Task Manager** para ver el proceso node.exe.

---

## 🔄 Paso 8: Actualizaciones

Cuando hagas cambios en el código:

1. **Copia los archivos actualizados** al servidor
2. **Recicla el Application Pool:**
   ```powershell
   Restart-WebAppPool -Name "API_Fiscalia_Pool"
   ```

   O en IIS Manager:
   - Click derecho en el Application Pool
   - Click en **"Reciclar"**

3. **Verifica los cambios**

---

## 🚨 Troubleshooting

### Error: "500.19 - Internal Server Error"

**Causa:** web.config mal configurado

**Solución:** Verifica la sintaxis del web.config

### Error: "iisnode not found"

**Causa:** iisnode no está instalado

**Solución:** Instala iisnode y reinicia IIS

### Error: "Cannot find module 'express'"

**Causa:** Dependencias no instaladas

**Solución:**
```cmd
cd C:\inetpub\wwwroot\api_fiscalia
npm install
```

### El sitio no responde

**Soluciones:**
1. Verifica que el Application Pool esté iniciado
2. Revisa los logs en `iisnode\`
3. Verifica permisos de carpeta
4. Verifica que Node.js esté en el PATH del sistema

### Error: "ENOENT: no such file or directory, open '.env'"

**Causa:** El archivo .env no existe

**Solución:** Crea el archivo `.env` con las variables necesarias

---

## 📝 Checklist de Despliegue

- [ ] Node.js instalado
- [ ] iisnode instalado
- [ ] URL Rewrite Module instalado
- [ ] Proyecto copiado al servidor
- [ ] `npm install` ejecutado
- [ ] Archivo `.env` creado con API_TOKEN
- [ ] Archivo `web.config` creado
- [ ] Sitio creado en IIS
- [ ] Permisos configurados
- [ ] Firewall configurado
- [ ] `/health` funciona
- [ ] `/api/fiscalia/json` funciona con token

---

## 🎯 Ventajas de usar IIS Local

✅ **IP ecuatoriana** - No hay bloqueo del sitio de Fiscalía
✅ **Control total** - Tu propio servidor
✅ **Sin costos** - No pagas hosting externo
✅ **Rápido** - Red local
✅ **Seguro** - Detrás de tu firewall

---

## 🌐 Acceso desde Internet (Opcional)

Si necesitas acceso desde internet:

### Opción 1: Port Forwarding en Router

1. Configura port forwarding en tu router
2. Puerto externo: 8080 → IP del servidor: 8080
3. Obtén tu IP pública
4. Accede desde: `http://TU-IP-PUBLICA:8080`

### Opción 2: DNS Dinámico

1. Usa servicios como No-IP o DuckDNS
2. Configura un dominio tipo: `api-fiscalia.ddns.net`
3. Apunta al puerto configurado

### Opción 3: VPN

Crea una VPN para acceso seguro desde fuera de la red.

---

## ✅ Resultado Final

Tu API estará disponible en:

**Desde el servidor:**
```
http://localhost:8080
```

**Desde la red local:**
```
http://192.168.X.X:8080
```

**Desde internet (con port forwarding):**
```
http://TU-IP-PUBLICA:8080
```

**Endpoints:**
- Health: `/health`
- API HTML: `/api/fiscalia?cedula=XXX&token=YYY`
- API JSON: `/api/fiscalia/json?cedula=XXX&token=YYY`

---

¿Necesitas ayuda con algún paso específico del despliegue en IIS?
