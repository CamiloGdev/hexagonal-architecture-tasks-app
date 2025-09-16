# Reto Técnico Full-Stack - Lista de Tareas

Este repositorio contiene el código fuente para una aplicación web completa de lista de tareas. Es un monorepo gestionado con **pnpm workspaces**, dividido en un backend y un frontend.

- **Backend (`/backend`):** Una API RESTful construida con **Node.js** y **Express**. Utiliza **Prisma** como ORM para interactuar con una base de datos PostgreSQL. Sigue principios de **arquitectura hexagonal** para una clara separación de responsabilidades, usa **Zod** para la validación de datos y gestiona la autenticación mediante **JWT** con tokens de acceso y de refresco administrados a través de cookies seguras (HttpOnly).
- **Frontend (`/frontend`):** Una aplicación de una sola página (SPA) desarrollada con **React**, **TypeScript** y empaquetada con **Rspack** para un rendimiento de desarrollo y construcción optimizado.

## Prerequisites

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu sistema:

- **Node.js**: Se recomienda la versión `v20.x` o superior.
- **pnpm**: Si no lo tienes activado, puedes activarlo con el comando `corepack enable`.
- **PostgreSQL**: Es necesario tener una instancia de PostgreSQL en ejecución. Se recomienda usar Docker para una configuración sencilla.

    ```bash
    # Ejemplo para levantar una instancia de PostgreSQL con Docker
    docker run --name tasks-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=fracttal_db -p 5432:5432 -d postgres
    ```

-----

## ✨ Calidad de Código (Linting y Formateo)

Este proyecto utiliza **Biome** para garantizar una calidad de código consistente y un formato unificado en todo el monorepo. Biome es una herramienta de alto rendimiento construida en **Rust**, lo que la hace extremadamente rápida para formatear y analizar tu código.

Biome está configurado en la raíz del proyecto para que sus reglas apliquen tanto al `backend` como al `frontend`.

### 🧩 Integración con el Editor de Código

Para una mejor experiencia de desarrollo, se recomienda **altamente** instalar la extensión oficial de **Biome** en tu editor de código (por ejemplo, para [VS Code](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)). Esto te proporcionará:

- Formateo automático al guardar.
- Resaltado de errores y advertencias en tiempo real.
- Sugerencias para correcciones rápidas.

### 🖥️ Comandos por Consola

Puedes ejecutar los scripts de Biome manualmente desde la **raíz del proyecto** para verificar o formatear todo el código de una sola vez.

- **Para formatear todo el código:**
    Este comando recorre todos los archivos y aplica las reglas de formato.

    ```bash
    pnpm format
    ```

- **Para revisar (lint) y aplicar correcciones seguras:**
    Este comando analiza el código en busca de errores, problemas de estilo y posibles bugs, aplicando automáticamente las correcciones que son seguras.

    ```bash
    pnpm check
    ```

-----

## 🚀 Instalación y Configuración Inicial

Sigue estos pasos para poner en marcha el proyecto en tu máquina local.

1. **Clonar el Repositorio**

    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd <NOMBRE_DEL_REPOSITORIO>
    ```

2. **Instalar Dependencias**
    Desde la raíz del proyecto, ejecuta el siguiente comando. `pnpm` se encargará de instalar las dependencias para ambos workspaces (`frontend` y `backend`).

    ```bash
    pnpm install
    ```

3. **Configurar Variables de Entorno (Backend)**
    Navega al directorio del backend, crea un archivo `.env` a partir del ejemplo proporcionado y ajústalo según tu configuración local.

    ```bash
    cd backend
    cp .env.example .env
    ```

    Abre el archivo `.env` y asegúrate de que la variable `DATABASE_URL` coincida con las credenciales de tu base de datos PostgreSQL. Si usaste el comando de Docker anterior, la URL por defecto debería funcionar.

-----

## 🏭 Despliegue (Producción)

Estos son los pasos para construir y ejecutar la aplicación en un entorno de producción.

### Backend

1. **Generar Cliente de Prisma**
    Este comando lee tu `schema.prisma` y genera un cliente de Prisma optimizado y tipado, lo que garantiza la seguridad de tipos en todas las interacciones con la base de datos.

    ```bash
    pnpm --filter tasks_fracttal_back prisma:generate
    ```

2. **Ejecutar Migraciones de la Base de Datos**
    Este comando aplica todas las migraciones pendientes que se encuentran en la carpeta `prisma/migrations` para actualizar el esquema de la base de datos a su última versión. Para producción, se utiliza `prisma migrate deploy`, que es no interactivo y está diseñado para entornos de despliegue.

    ```bash
    pnpm --filter tasks_fracttal_back prisma:deploy
    ```

3. **Construir la Aplicación (Build)**
    Este comando transpila el código TypeScript del backend a JavaScript plano, generando los archivos de salida en el directorio `dist/`.

    ```bash
    pnpm --filter tasks_fracttal_back build
    ```

4. **Iniciar el Servidor**
    Ejecuta la aplicación compilada. El servidor se iniciará y la API estará disponible en el host y puerto que hayas configurado en tus variables de entorno.

    ```bash
    pnpm --filter tasks_fracttal_back start
    ```

### Frontend

1. **Construir la Aplicación (Build)**
    Este comando crea una versión optimizada y minificada de la aplicación de React, generando archivos estáticos (HTML, CSS, JS) en el directorio `dist/` del frontend.

    ```bash
    pnpm --filter tasks_fracttal_front build
    ```

    Después de este paso, debes servir los archivos estáticos generados a través de un servidor web como Nginx, Vercel, o similar.

-----

## 💻 Desarrollo Local

Para desarrollar y probar la aplicación en tu máquina local.

### Backend

Los primeros dos pasos son los mismos que en producción, pero se utiliza un comando de migración diferente.

1. **Generar Cliente de Prisma**
    Asegura que tu cliente Prisma esté sincronizado con el esquema.

    ```bash
    pnpm --filter tasks_fracttal_back prisma:generate
    ```

2. **Ejecutar Migraciones y Seeders**
    El comando `prisma migrate dev` está diseñado para el desarrollo. No solo aplica las migraciones, sino que también detecta cambios en tu `schema.prisma` para crear nuevos archivos de migración. Además, después de aplicar las migraciones, **ejecuta automáticamente el script de `seed.ts`** para poblar la base de datos con datos de prueba, lo que te proporciona un entorno listo para usar.

    ```bash
    pnpm --filter tasks_fracttal_back prisma:migrate
    ```

3. **Iniciar el Servidor de Desarrollo**
    Este comando inicia el servidor en modo de desarrollo con `tsx`, que permite la recarga en caliente (`hot-reloading`) cada vez que realizas un cambio en el código fuente.

    ```bash
    pnpm --filter tasks_fracttal_back dev
    ```

      - ✅ La API estará disponible en `http://localhost:<PORT>`, donde `<PORT>` es el valor que definiste en tu archivo `.env` (por defecto `3001`).
      - 📖 Puedes acceder a la **documentación interactiva de la API (Swagger UI)** en la siguiente ruta para ver todos los endpoints y probarlos directamente desde el navegador:
        `http://localhost:<PORT>/api-docs`

### Frontend

1. **Iniciar el Servidor de Desarrollo**
    Este comando inicia el servidor de desarrollo de Rspack para la aplicación de React. Incluye recarga en caliente y abrirá automáticamente una nueva pestaña en tu navegador.

    ```bash
    pnpm --filter tasks_fracttal_front dev
    ```

      - ✅ La aplicación estará disponible y se abrirá en `http://localhost:3000` (o el puerto que Rspack asigne si el 3000 está ocupado).
