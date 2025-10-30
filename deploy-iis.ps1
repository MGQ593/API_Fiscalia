# Script de despliegue automático para IIS
# Ejecutar como Administrador

param(
    [string]$SiteName = "API_Fiscalia",
    [string]$Port = "8080",
    [string]$PhysicalPath = "C:\inetpub\wwwroot\api_fiscalia",
    [string]$AppPoolName = "API_Fiscalia_Pool"
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Despliegue de API Fiscalía en IIS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que se ejecuta como administrador
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "ERROR: Este script debe ejecutarse como Administrador" -ForegroundColor Red
    Write-Host "Click derecho en PowerShell y selecciona 'Ejecutar como administrador'" -ForegroundColor Yellow
    exit 1
}

# Importar módulo de IIS
Import-Module WebAdministration -ErrorAction Stop

Write-Host "[1/8] Creando directorio de destino..." -ForegroundColor Green
if (-not (Test-Path $PhysicalPath)) {
    New-Item -ItemType Directory -Path $PhysicalPath -Force | Out-Null
    Write-Host "      Directorio creado: $PhysicalPath" -ForegroundColor Gray
} else {
    Write-Host "      Directorio ya existe: $PhysicalPath" -ForegroundColor Gray
}

Write-Host "[2/8] Copiando archivos del proyecto..." -ForegroundColor Green
$currentPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Copy-Item -Path "$currentPath\*" -Destination $PhysicalPath -Recurse -Force -Exclude @(".git", "node_modules", "iisnode")
Write-Host "      Archivos copiados correctamente" -ForegroundColor Gray

Write-Host "[3/8] Instalando dependencias de Node.js..." -ForegroundColor Green
Push-Location $PhysicalPath
npm install --production
Pop-Location
Write-Host "      Dependencias instaladas" -ForegroundColor Gray

Write-Host "[4/8] Creando Application Pool..." -ForegroundColor Green
if (Test-Path "IIS:\AppPools\$AppPoolName") {
    Write-Host "      Application Pool ya existe, eliminando..." -ForegroundColor Yellow
    Remove-WebAppPool -Name $AppPoolName
}
New-WebAppPool -Name $AppPoolName | Out-Null
Set-ItemProperty "IIS:\AppPools\$AppPoolName" -name "managedRuntimeVersion" -value ""
Write-Host "      Application Pool creado: $AppPoolName" -ForegroundColor Gray

Write-Host "[5/8] Creando sitio web en IIS..." -ForegroundColor Green
if (Test-Path "IIS:\Sites\$SiteName") {
    Write-Host "      Sitio ya existe, eliminando..." -ForegroundColor Yellow
    Remove-Website -Name $SiteName
}
New-Website -Name $SiteName `
            -Port $Port `
            -PhysicalPath $PhysicalPath `
            -ApplicationPool $AppPoolName | Out-Null
Write-Host "      Sitio creado: $SiteName en puerto $Port" -ForegroundColor Gray

Write-Host "[6/8] Configurando permisos..." -ForegroundColor Green
$acl = Get-Acl $PhysicalPath
$permission = "IIS AppPool\$AppPoolName", "Read,ReadAndExecute", "ContainerInherit,ObjectInherit", "None", "Allow"
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission
$acl.SetAccessRule($accessRule)
Set-Acl $PhysicalPath $acl
Write-Host "      Permisos configurados" -ForegroundColor Gray

Write-Host "[7/8] Configurando Firewall..." -ForegroundColor Green
$firewallRuleName = "API Fiscalia - Puerto $Port"
$existingRule = Get-NetFirewallRule -DisplayName $firewallRuleName -ErrorAction SilentlyContinue
if ($existingRule) {
    Write-Host "      Regla de firewall ya existe" -ForegroundColor Gray
} else {
    New-NetFirewallRule -DisplayName $firewallRuleName `
                         -Direction Inbound `
                         -LocalPort $Port `
                         -Protocol TCP `
                         -Action Allow | Out-Null
    Write-Host "      Regla de firewall creada para puerto $Port" -ForegroundColor Gray
}

Write-Host "[8/8] Verificando archivo .env..." -ForegroundColor Green
$envFile = Join-Path $PhysicalPath ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "      ADVERTENCIA: Archivo .env no encontrado!" -ForegroundColor Yellow
    Write-Host "      Creando archivo .env de ejemplo..." -ForegroundColor Yellow
    @"
PORT=$Port
API_TOKEN=3ac3d1049184bc7d9c69f3cae9cb9171dcde93d1029fbc992c8c70d867cacd4d
NODE_ENV=production
"@ | Out-File -FilePath $envFile -Encoding UTF8
    Write-Host "      Archivo .env creado. IMPORTANTE: Verifica el API_TOKEN" -ForegroundColor Yellow
} else {
    Write-Host "      Archivo .env encontrado" -ForegroundColor Gray
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "   DESPLIEGUE COMPLETADO EXITOSAMENTE!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Información del despliegue:" -ForegroundColor Cyan
Write-Host "  Sitio:              $SiteName" -ForegroundColor White
Write-Host "  Puerto:             $Port" -ForegroundColor White
Write-Host "  Ruta física:        $PhysicalPath" -ForegroundColor White
Write-Host "  Application Pool:   $AppPoolName" -ForegroundColor White
Write-Host ""
Write-Host "URLs de acceso:" -ForegroundColor Cyan
Write-Host "  Local:              http://localhost:$Port/health" -ForegroundColor White
Write-Host "  Red local:          http://$(hostname):$Port/health" -ForegroundColor White
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Verifica que el sitio responda: http://localhost:$Port/health" -ForegroundColor White
Write-Host "  2. Revisa el archivo .env en: $PhysicalPath\.env" -ForegroundColor White
Write-Host "  3. Prueba el endpoint: http://localhost:$Port/api/fiscalia/json?cedula=1717199457" -ForegroundColor White
Write-Host ""
Write-Host "Logs de iisnode:" -ForegroundColor Yellow
Write-Host "  $PhysicalPath\iisnode\" -ForegroundColor White
Write-Host ""

# Abrir navegador con health check
Start-Process "http://localhost:$Port/health"
