@echo off
setlocal enabledelayedexpansion
title Instalador automatico de Node.js + PM2

:: ============================================================
::  Instalador automatico de Node.js + PM2 para Windows
::  - Instala Node.js LTS si no esta presente
::  - Instala PM2 globalmente
::  - Mueve carpeta "installs" del Escritorio a C:\installs
::  - Ejecuta C:\installs\index.js con PM2
::  - Guarda el proceso y configura autostart al reiniciar
:: ============================================================

:: --- Nombre del servicio en PM2 (cambia este valor si deseas otro nombre) ---
set SERVICE_NAME=servicioLocal

echo.
echo  ============================================
echo   Instalador automatico Node.js + PM2
echo  ============================================
echo.

:: ============================================================
::  PASO 0: Verificar permisos de administrador
:: ============================================================
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Este script necesita permisos de administrador.
    echo  Por favor, haz clic derecho en el archivo .bat y selecciona
    echo  "Ejecutar como administrador".
    echo.
    pause
    exit /b 1
)
echo  [OK] Permisos de administrador confirmados.

:: ============================================================
::  PASO 1: Instalar Node.js (si no esta instalado)
:: ============================================================
echo.
echo  [1/5] Verificando Node.js...

node --version >nul 2>&1
if %ERRORLEVEL% == 0 (
    for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
    echo  [OK] Node.js ya instalado: !NODE_VER!
    goto :INSTALAR_PM2
)

echo  Node.js no encontrado. Descargando e instalando...
echo.

:: Detectar arquitectura
if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
    set ARCH=x64
) else if "%PROCESSOR_ARCHITEW6432%"=="AMD64" (
    set ARCH=x64
) else (
    set ARCH=x86
)
echo  Arquitectura: %ARCH%

:: Definir version
set NODE_VERSION=v22.17.0
set NODE_INSTALLER=node-%NODE_VERSION%-win-%ARCH%.msi
set DOWNLOAD_URL=https://nodejs.org/dist/%NODE_VERSION%/%NODE_INSTALLER%
set TEMP_FILE=%TEMP%\%NODE_INSTALLER%

echo  Descargando Node.js %NODE_VERSION%...
powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $ProgressPreference='SilentlyContinue'; Invoke-WebRequest -Uri '%DOWNLOAD_URL%' -OutFile '%TEMP_FILE%' -UseBasicParsing }" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo  [AVISO] PowerShell fallo. Intentando con curl...
    curl -L -o "%TEMP_FILE%" "%DOWNLOAD_URL%"
    if %ERRORLEVEL% NEQ 0 (
        echo  [ERROR] No se pudo descargar Node.js. Verifica tu conexion.
        pause
        exit /b 1
    )
)

if not exist "%TEMP_FILE%" (
    echo  [ERROR] El archivo no se descargo correctamente.
    pause
    exit /b 1
)

echo  Instalando Node.js en silencio...
msiexec /i "%TEMP_FILE%" /qn /norestart ADDLOCAL=ALL
if %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] La instalacion de Node.js fallo. Codigo: %ERRORLEVEL%
    pause
    exit /b 1
)
del /f /q "%TEMP_FILE%" >nul 2>&1
echo  [OK] Node.js instalado correctamente.

:: Refrescar PATH en la sesion actual
for /f "tokens=2*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v "Path" 2^>nul') do set SYS_PATH=%%b
for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v "Path" 2^>nul') do set USR_PATH=%%b
set PATH=%SYS_PATH%;%USR_PATH%;%PATH%
timeout /t 3 /nobreak >nul

:: ============================================================
::  PASO 2: Instalar PM2
:: ============================================================
:INSTALAR_PM2
echo.
echo  [2/5] Verificando PM2...

pm2 --version >nul 2>&1
if %ERRORLEVEL% == 0 (
    for /f "tokens=*" %%p in ('pm2 --version') do set PM2_VER=%%p
    echo  [OK] PM2 ya instalado: v!PM2_VER!
    goto :MOVER_CARPETA
)

echo  Instalando PM2 globalmente...
npm install -g pm2
if %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Fallo la instalacion de PM2.
    pause
    exit /b 1
)

:: Instalar pm2-windows-startup para autostart en Windows
echo  Instalando pm2-windows-startup...
npm install -g pm2-windows-startup >nul 2>&1

:: Refrescar PATH de nuevo para que pm2 sea reconocido
for /f "tokens=2*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v "Path" 2^>nul') do set SYS_PATH=%%b
set PATH=%SYS_PATH%;%USR_PATH%;%PATH%

for /f "tokens=*" %%p in ('pm2 --version 2^>nul') do set PM2_VER=%%p
echo  [OK] PM2 instalado: v!PM2_VER!

:: ============================================================
::  PASO 3: Mover carpeta "installs" del Escritorio a C:\
:: ============================================================
:MOVER_CARPETA
echo.
echo  [3/5] Moviendo carpeta installs al disco C:\...

:: Obtener ruta del escritorio del usuario actual
for /f "tokens=2*" %%a in ('reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders" /v "Desktop" 2^>nul') do set DESKTOP=%%b

set ORIGEN=%DESKTOP%\installs
set DESTINO=C:\installs

:: Verificar que la carpeta origen existe
if not exist "%ORIGEN%" (
    echo  [AVISO] No se encontro la carpeta "%ORIGEN%".
    echo  Asegurate de que la carpeta "installs" este en el Escritorio.
    echo.
    echo  Si ya esta en C:\installs, se continuara con ese directorio.
    if not exist "%DESTINO%" (
        echo  [ERROR] Tampoco existe C:\installs. No se puede continuar.
        pause
        exit /b 1
    )
    echo  [OK] Usando directorio existente: %DESTINO%
    goto :VERIFICAR_INDEX
)

:: Si ya existe C:\installs, eliminarlo antes de mover
if exist "%DESTINO%" (
    echo  [AVISO] C:\installs ya existe. Se reemplazara con la version del Escritorio.
    rmdir /s /q "%DESTINO%" >nul 2>&1
)

:: Mover la carpeta
move "%ORIGEN%" "C:\" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  [AVISO] Move fallo. Intentando con robocopy...
    robocopy "%ORIGEN%" "%DESTINO%" /E /MOVE /NFL /NDL /NJH /NJS >nul 2>&1
    if %ERRORLEVEL% GEQ 8 (
        echo  [ERROR] No se pudo mover la carpeta installs.
        pause
        exit /b 1
    )
)
echo  [OK] Carpeta movida a: %DESTINO%

:: ============================================================
::  PASO 4: Verificar index.js y lanzar con PM2
:: ============================================================
:VERIFICAR_INDEX
echo.
echo  [4/5] Iniciando servicio en PM2...

set APP_PATH=C:\installs\index.js

if not exist "%APP_PATH%" (
    echo  [ERROR] No se encontro el archivo: %APP_PATH%
    echo  Verifica que index.js exista dentro de C:\installs\
    pause
    exit /b 1
)
echo  [OK] Archivo encontrado: %APP_PATH%

:: Verificar node_modules y ejecutar npm install si es necesario
if not exist "C:\installs\node_modules" (
    echo  node_modules no encontrado. Ejecutando npm install...
    pushd C:\installs
    npm install
    if %ERRORLEVEL% NEQ 0 (
        echo  [ERROR] npm install fallo. Revisa el archivo package.json.
        popd
        pause
        exit /b 1
    )
    popd
    echo  [OK] Dependencias instaladas correctamente.
) else (
    echo  [OK] node_modules ya existe. Omitiendo npm install.
)

:: Detener instancia anterior con el mismo nombre si existe
pm2 describe %SERVICE_NAME% >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo  [AVISO] Ya existe un proceso PM2 llamado "%SERVICE_NAME%". Se reiniciara.
    pm2 delete %SERVICE_NAME% >nul 2>&1
)

:: Iniciar la aplicacion con PM2
echo  Iniciando "%SERVICE_NAME%" con PM2...
pm2 start "%APP_PATH%" --name "%SERVICE_NAME%"
if %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] PM2 no pudo iniciar el proceso.
    pause
    exit /b 1
)
echo  [OK] Servicio "%SERVICE_NAME%" iniciado en PM2.

:: ============================================================
::  PASO 5: Guardar proceso y configurar autostart
:: ============================================================
echo.
echo  [5/5] Configurando inicio automatico con PM2...

:: Guardar la lista de procesos pm2
pm2 save
if %ERRORLEVEL% NEQ 0 (
    echo  [AVISO] pm2 save retorno un error. Intentando de todas formas...
)
echo  [OK] Lista de procesos guardada en PM2.

:: Configurar autostart usando pm2-windows-startup
pm2-startup >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo  [OK] Autostart configurado con pm2-windows-startup.
) else (
    :: Alternativa: usar el Task Scheduler de Windows
    echo  Configurando autostart via Programador de Tareas de Windows...
    set PM2_PATH=
    for /f "tokens=*" %%i in ('where pm2 2^>nul') do set PM2_PATH=%%i
    if "!PM2_PATH!"=="" (
        for /f "tokens=*" %%i in ('where pm2.cmd 2^>nul') do set PM2_PATH=%%i
    )
    if "!PM2_PATH!" NEQ "" (
        schtasks /create /tn "PM2 Autostart" /tr "\"!PM2_PATH!\" resurrect" /sc ONLOGON /ru "%USERNAME%" /rl HIGHEST /f >nul 2>&1
        if %ERRORLEVEL% == 0 (
            echo  [OK] Tarea programada "PM2 Autostart" creada correctamente.
        ) else (
            echo  [AVISO] No se pudo crear la tarea programada automaticamente.
            echo  Para hacerlo manual: ejecuta "pm2 save" y luego "pm2 resurrect"
            echo  al iniciar Windows, o usa el Programador de Tareas.
        )
    ) else (
        echo  [AVISO] No se pudo localizar pm2. Abre una nueva consola y ejecuta:
        echo         pm2 save
        echo         pm2-startup  (o pm2 resurrect al iniciar sesion)
    )
)

:: ============================================================
::  RESUMEN FINAL
:: ============================================================
echo.
echo  ============================================
echo   Configuracion completada
echo  ============================================
for /f "tokens=*" %%v in ('node --version 2^>nul') do set NODE_VER=%%v
for /f "tokens=*" %%n in ('npm --version 2^>nul') do set NPM_VER=%%n
for /f "tokens=*" %%p in ('pm2 --version 2^>nul') do set PM2_VER=%%p
echo   Node.js    : !NODE_VER!
echo   npm        : !NPM_VER!
echo   PM2        : v!PM2_VER!
echo   App        : %APP_PATH%
echo   Servicio   : %SERVICE_NAME%
echo   Autostart  : Habilitado
echo  ============================================
echo.
echo  Comandos utiles:
echo    pm2 list                    - Ver procesos activos
echo    pm2 logs %SERVICE_NAME%     - Ver logs del servicio
echo    pm2 restart %SERVICE_NAME%  - Reiniciar el servicio
echo    pm2 stop %SERVICE_NAME%     - Detener el servicio
echo.
pause
endlocal