# MiDespacho Backend (NestJS + TypeORM + PostgreSQL)

Backend del modulo de expediente juridico para la prueba tecnica de MiDespacho.

## Objetivo del modulo
Este servicio expone APIs para:
- Crear y consultar expedientes.
- Cargar multiples archivos en una sola accion, agrupados en un lote con `batchTitle` y `batchDescription`.
- Listar archivos de un expediente con paginacion y filtros.

No incluye visor de documentos, solo gestion de carga y listado.

## Stack
- NestJS 11
- TypeORM 0.3
- PostgreSQL
- class-validator / class-transformer
- Swagger
- Throttler + Helmet + CORS

## Arquitectura
Estructura orientada a Clean Architecture:
- `src/modules/*/domain`: entidades y enums de dominio.
- `src/modules/*/application`: casos de uso y puertos.
- `src/modules/*/infrastructure`: adapters TypeORM y storage.
- `src/modules/*/interface/http`: controllers y DTOs HTTP.
- `src/shared`: errores de aplicacion, filtros HTTP y utilidades transaccionales.

## Requisitos
- Node.js 22+
- npm 10+
- PostgreSQL 14+

## Variables de entorno
Copiar `.env.example` a `.env` y ajustar valores:

```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:4200
FRONTEND_URLS=http://localhost:4200,http://localhost:4000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=midespacho
DATABASE_PASSWORD=midespacho
DATABASE_NAME=midespacho
DATABASE_SSL=false

JWT_SECRET=replace_in_env
JWT_EXPIRES_IN=1h
COOKIE_NAME=md_auth

STORAGE_PROVIDER=local
MAX_FILES_PER_UPLOAD=20
MAX_FILE_SIZE_MB=15
LOCAL_UPLOADS_DIR=uploads
LOCAL_UPLOADS_ROUTE_PREFIX=uploads
LOCAL_UPLOADS_BASE_URL=http://localhost:3000/uploads

CLOUDINARY_CLOUD_NAME=replace_in_env
CLOUDINARY_API_KEY=replace_in_env
CLOUDINARY_API_SECRET=replace_in_env
CLOUDINARY_FOLDER=midespacho
```

## Instalacion
```powershell
cd E:\Entrevista\MiDespacho\midespacho-backend-nest
npm.cmd install
```

## Base de datos
Crear base de datos en PostgreSQL y ejecutar migraciones:

```powershell
npm.cmd run migration:run
```

## Ejecutar proyecto
```powershell
# desarrollo
npm.cmd run start:dev

# produccion (requiere build)
npm.cmd run build
npm.cmd run start:prod
```

API base local:
- `http://localhost:3000/api/v1`

Swagger:
- `http://localhost:3000/docs`

## Endpoints principales
Con prefijo global `api/v1`:

- `POST /cases`
- `GET /cases/:caseId`
- `POST /cases/:caseId/files` (multipart/form-data, campo `files`)
- `GET /cases/:caseId/files?page=1&limit=20&batchId=&search=`

### Ejemplo de carga multiple
```bash
curl -X POST "http://localhost:3000/api/v1/cases/<CASE_ID>/files" \
  -F "batchTitle=Lote Inicial" \
  -F "batchDescription=Documentos iniciales del expediente" \
  -F "files=@./demanda.pdf" \
  -F "files=@./poder.pdf"
```

## Calidad y pruebas
```powershell
# lint
npm.cmd run lint

# unit/integration (jest)
npm.cmd run test

# integration especificas
npm.cmd run test:integration

# e2e
npm.cmd run test:e2e
```

## Storage
Soporta 2 providers:
- `local` (default): guarda archivos en disco y los expone en `/uploads`.
- `cloudinary`: upload y delete por API de Cloudinary.

Seleccion por variable:
- `STORAGE_PROVIDER=local|cloudinary`

## Notas
- En PowerShell de Windows se usa `npm.cmd` para evitar bloqueo por politicas de `npm.ps1`.
- `case_files` usa soft delete (`deleted_at`) para no perder trazabilidad historica.
