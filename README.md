# Proyecto Hackathon

Proyecto web desarrollado con **NestJS** para el backend, **Next.js con TypeScript** para el frontend y **PostgreSQL** como base de datos.

## Requisitos del sistema

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- Node.js LTS
- npm
- PostgreSQL
- Git

## Tecnologías utilizadas

### Backend

- NestJS
- TypeScript
- Prisma
- PostgreSQL
- Cookie Parser
- Class Validator
- Class Transformer
-- CASL para autorización por permisos y roles

### Frontend

- Next.js
- TypeScript
- React

### Herramientas

- npm
- concurrently

## Clonar el repositorio

```bash
git clone https://github.com/RogerGTWAR/Proyecto_Hackathon.git
```

## Instalar dependencias

Instalar dependencias de la raíz del proyecto:

```bash
npm install
```

Instalar dependencias del backend:

```bash
cd backend
npm install
npm install cookie-parser class-validator class-transformer @nestjs/config
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install bcrypt
npm install @casl/ability
npm install @nestjs/mapped-types
npm install -D @types/cookie-parser @types/bcrypt @types/passport-jwt
```

Instalar dependencias del frontend:

```bash
cd ../frontend
npm install
```

Volver a la raíz del proyecto:

```bash
cd ..
```

En la raíz del proyecto encontrarás el archivo:

Script.sql
Debes ejecutar este archivo en PostgreSQL.

Configurar variables de entorno

Dentro de las carpetas /backend y /frontend encontrarás archivos de ejemplo llamados:
.env.example
Debes copiar el contenido de esos archivos y crear los siguientes archivos:

backend/.env
frontend/.env

Luego reemplaza las variables de entorno con tus propias credenciales.

#Correr el programa

En la raíz del proyecto ejecuta:
```bash
npm run dev
```

Este comando ejecuta el backend y el frontend al mismo tiempo., quiero que me actualices esto tomando en cuenta todo lo que hemos hecho
