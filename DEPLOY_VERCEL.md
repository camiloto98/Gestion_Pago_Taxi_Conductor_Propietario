# Guía de despliegue — Vercel + Railway

Publicar el aplicativo **Gestión Pago Taxi** en producción usando:

| Componente | Plataforma | Carpeta |
|------------|------------|---------|
| Frontend React (Vite) | **Vercel** | `taxi/` |
| Backend Express (API) | **Railway** | `server/` |
| Base de datos MySQL | **Railway** | — |

> **¿Por qué dos plataformas?** Vercel es ideal para el frontend estático. El backend necesita un servidor Node.js persistente y almacenamiento de imágenes (comprobantes de pago, feed). Railway cubre eso con MySQL incluido.

---

## Requisitos previos

- [ ] Cuenta en [GitHub](https://github.com) con el código del proyecto
- [ ] Cuenta en [Railway](https://railway.app) (backend + MySQL)
- [ ] Cuenta en [Vercel](https://vercel.com) (frontend)
- [ ] Cliente MySQL local para ejecutar el schema (MySQL Workbench, DBeaver, CLI, etc.)

---

## Resumen del flujo

```
1. Railway → Crear MySQL y ejecutar schema.sql
2. Railway → Desplegar backend (server/)
3. Vercel  → Desplegar frontend (taxi/) apuntando al backend
4. Railway → Configurar FRONTEND_URL con la URL de Vercel
5. Probar login, calendario e imágenes
```

---

# PARTE 1 — Backend y MySQL en Railway

## Paso 1.1 — Crear proyecto en Railway

1. Entra a [railway.app](https://railway.app) e inicia sesión con GitHub.
2. Clic en **New Project**.
3. Elige **Deploy from GitHub repo**.
4. Autoriza Railway si te lo pide y selecciona el repositorio `Gestion_Pago_Taxi_Conductor_Propietario`.

Railway creará un primer servicio automáticamente. Lo configuraremos en los siguientes pasos.

---

## Paso 1.2 — Agregar MySQL

1. Dentro del proyecto, clic en **+ New** (o **Add Service**).
2. Selecciona **Database → MySQL**.
3. Espera a que el servicio MySQL quede en estado **Active**.
4. Entra al servicio MySQL → pestaña **Variables** o **Connect**.
5. Anota estos valores (Railway los genera automáticamente):

| Variable Railway | Para qué sirve |
|------------------|----------------|
| `MYSQLHOST` | Host de conexión |
| `MYSQLPORT` | Puerto (normalmente `3306`) |
| `MYSQLUSER` | Usuario |
| `MYSQLPASSWORD` | Contraseña |
| `MYSQLDATABASE` | Nombre de la base (`railway` por defecto) |

### Ejecutar el schema (crear tablas)

1. En el servicio MySQL, abre **Connect** → copia la **URL de conexión** o los datos de conexión pública.
2. Conéctate con tu cliente MySQL (Workbench, DBeaver, etc.) usando esos datos.
3. Ejecuta el contenido del archivo `database/schema.sql` del repositorio.
4. Verifica que se crearon las tablas (`usuarios`, `vehiculos`, `pagos_diarios`, etc.).

> **Tip:** Si la conexión pública falla, en Railway → MySQL → **Settings** → activa **Public Networking** y usa el host público que te muestre.

---

## Paso 1.3 — Configurar el servicio del backend

Si Railway creó un servicio al importar el repo, úsalo. Si no:

1. **+ New → GitHub Repo** → mismo repositorio.
2. Entra al servicio del backend (no al de MySQL).
3. Ve a **Settings**:

| Setting | Valor |
|---------|-------|
| **Root Directory** | `server` |
| **Start Command** | `npm start` |
| **Build Command** | `npm ci` (opcional; Railway lo infiere) |

4. En **Networking → Public Networking**, clic en **Generate Domain**.
5. Copia la URL pública, por ejemplo:
   ```
   https://gestion-taxi-api-production.up.railway.app
   ```
   Esta será la URL de tu API.

---

## Paso 1.4 — Variables de entorno del backend (Railway)

En el servicio del **backend** (no MySQL) → **Variables** → **Add Variable**:

### Opción A — Referencias al servicio MySQL (recomendado)

Railway permite referenciar variables de otro servicio. Clic en **Add Reference** y selecciona el servicio MySQL:

| Variable en backend | Referencia / valor |
|---------------------|-------------------|
| `DB_HOST` | `${{MySQL.MYSQLHOST}}` |
| `DB_USER` | `${{MySQL.MYSQLUSER}}` |
| `DB_PASSWORD` | `${{MySQL.MYSQLPASSWORD}}` |
| `DB_NAME` | `${{MySQL.MYSQLDATABASE}}` |

### Opción B — Valores manuales

Copia los valores del servicio MySQL uno a uno:

| Variable | Valor |
|----------|-------|
| `DB_HOST` | Valor de `MYSQLHOST` |
| `DB_USER` | Valor de `MYSQLUSER` |
| `DB_PASSWORD` | Valor de `MYSQLPASSWORD` |
| `DB_NAME` | Valor de `MYSQLDATABASE` |

### Variables adicionales obligatorias

| Variable | Valor | Notas |
|----------|-------|-------|
| `JWT_SECRET` | Clave larga aleatoria | Mínimo 32 caracteres. **No uses la de desarrollo.** |
| `FRONTEND_URL` | `https://tu-app.vercel.app` | La configurarás después del deploy en Vercel (paso 2.4) |

Generar `JWT_SECRET` en PowerShell:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Variable opcional — Imágenes persistentes (Volume)

Por defecto, las imágenes subidas se pierden al redeployar. Para persistirlas:

1. En el servicio backend → **Settings → Volumes** → **Add Volume**.
2. Monta el volumen en la ruta `/data/uploads`.
3. Agrega la variable:
   ```
   UPLOAD_PATH=/data/uploads
   ```

---

## Paso 1.5 — Desplegar el backend

1. Railway despliega automáticamente al detectar cambios en GitHub.
2. Si es la primera vez, espera a que el build termine (estado **Success** / verde).
3. Revisa los **Deploy Logs**. Debes ver:
   ```
   Server running on http://localhost:XXXX
   ✔ Base de datos conectada correctamente
   ```

### Verificar el backend

Abre en el navegador:

```
https://TU-BACKEND.up.railway.app/health
```

Respuesta esperada:

```json
{"ok":true}
```

Prueba también un endpoint de la API:

```
https://TU-BACKEND.up.railway.app/api/auth/login
```

(method POST con body — o simplemente confirma que no devuelve error de conexión)

---

# PARTE 2 — Frontend en Vercel

## Paso 2.1 — Importar el proyecto

1. Entra a [vercel.com/new](https://vercel.com/new).
2. Conecta GitHub y selecciona el repositorio.
3. En **Configure Project**, ajusta:

| Campo | Valor |
|-------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `taxi` ← **importante** |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm ci` |

Vercel detectará `taxi/vercel.json` si existe.

---

## Paso 2.2 — Variables de entorno en Vercel

Antes de hacer deploy, en **Environment Variables** agrega (reemplaza con tu URL de Railway):

| Variable | Valor de ejemplo | Entornos |
|----------|------------------|----------|
| `VITE_API_URL` | `https://gestion-taxi-api-production.up.railway.app/api` | Production, Preview |
| `VITE_STATIC_BASE_URL` | `https://gestion-taxi-api-production.up.railway.app` | Production, Preview |

> **Importante:** Las variables `VITE_*` se incluyen en el build. Si las cambias después, debes **redeployar** el frontend.

No incluyas barra final (`/`) al final de las URLs.

---

## Paso 2.3 — Desplegar

1. Clic en **Deploy**.
2. Espera a que termine el build.
3. Vercel te dará una URL, por ejemplo:
   ```
   https://gestion-pago-taxi.vercel.app
   ```

---

## Paso 2.4 — Conectar frontend y backend (CORS)

El backend solo acepta peticiones del frontend si `FRONTEND_URL` está bien configurada.

1. Copia la URL final de Vercel (ej. `https://gestion-pago-taxi.vercel.app`).
2. Ve a Railway → servicio **backend** → **Variables**.
3. Actualiza o agrega:
   ```
   FRONTEND_URL=https://gestion-pago-taxi.vercel.app
   ```
4. Railway redeployará automáticamente el backend.

> Las URLs de preview (`*.vercel.app`) también están permitidas por el backend.

---

# PARTE 3 — Verificación final

Checklist después de desplegar ambos servicios:

- [ ] `https://TU-BACKEND.up.railway.app/health` → `{"ok":true}`
- [ ] Abrir la URL de Vercel → carga la pantalla de login
- [ ] Iniciar sesión con un usuario de la base de datos
- [ ] Propietario: crear vehículo y token
- [ ] Conductor: registrar pago con imagen (comprobante)
- [ ] Ver imagen del comprobante en el calendario
- [ ] Feed: publicar con imagen

---

# Desarrollo local

Sin cambios respecto al entorno local:

```bash
# Terminal 1 — Backend
cd server
npm install
npm run dev

# Terminal 2 — Frontend
cd taxi
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- El proxy de Vite redirige `/api` y `/static` al backend local.

Opcional: copia `server/.env.example` → `server/.env` y `taxi/.env.example` → `taxi/.env.local`.

---

# Estructura de archivos de despliegue

```
/
├── DEPLOY_VERCEL.md       # Esta guía
├── database/
│   └── schema.sql         # Ejecutar en MySQL de Railway
├── server/
│   ├── railway.toml       # Configuración Railway
│   ├── .env.example
│   └── src/app.js         # API Express
└── taxi/
    ├── vercel.json        # Configuración Vercel (SPA)
    ├── .env.example
    └── src/
        ├── services/api.js      # VITE_API_URL
        └── config/env.js        # VITE_STATIC_BASE_URL
```

---

# Solución de problemas

| Problema | Causa probable | Solución |
|----------|----------------|----------|
| Error CORS al login | `FRONTEND_URL` incorrecta en Railway | Pon la URL exacta de Vercel (con `https://`) |
| `Network Error` en la app | `VITE_API_URL` mal configurada | Verifica URL de Railway + `/api` al final; redeploy en Vercel |
| Imágenes no cargan | Falta `VITE_STATIC_BASE_URL` | Pon la URL base de Railway (sin `/api`); redeploy Vercel |
| Backend no conecta a MySQL | Variables `DB_*` incorrectas | Usa referencias `${{MySQL.*}}` o copia valores del servicio MySQL |
| `health` no responde | Backend caído o sin dominio público | Revisa Deploy Logs en Railway; genera dominio en Networking |
| Imágenes se pierden al redeploy | Sin Volume en Railway | Monta volumen en `/data/uploads` y define `UPLOAD_PATH=/data/uploads` |
| 404 en rutas del frontend | Falta rewrite SPA | Confirma `taxi/vercel.json` y Root Directory = `taxi` |
| Build falla en Vercel | Dependencias | Ejecuta localmente `cd taxi && npm run build` |
| Build falla en Railway | Root Directory incorrecto | Debe ser `server`, no la raíz del repo |

---

# Redeploy automático

| Plataforma | Disparador |
|------------|------------|
| **Railway** | `git push` a la rama conectada → redeploy del backend |
| **Vercel** | `git push` → redeploy del frontend |

Si cambias variables `VITE_*` en Vercel, necesitas un redeploy manual o un nuevo push.

---

# Dominio personalizado (opcional)

### Vercel (frontend)
1. **Settings → Domains** → agrega tu dominio.
2. Actualiza `FRONTEND_URL` en Railway con el nuevo dominio.

### Railway (backend)
1. **Settings → Networking → Custom Domain**.
2. Actualiza `VITE_API_URL` y `VITE_STATIC_BASE_URL` en Vercel con el nuevo dominio del backend.
3. Redeploy del frontend en Vercel.

---

# Costos aproximados

- **Vercel:** plan Hobby gratuito suficiente para este proyecto.
- **Railway:** incluye crédito mensual gratuito limitado; MySQL + backend consumen créditos. Revisa [railway.app/pricing](https://railway.app/pricing).
