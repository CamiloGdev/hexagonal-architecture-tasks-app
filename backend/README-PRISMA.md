# Configuración de Repositorios con Prisma ORM

Este proyecto soporta dos tipos de repositorios para la gestión de usuarios, **ambos usando la misma base de datos PostgreSQL**:

## 1. PostgreSQL Directo (Existente)

- Utiliza consultas SQL directas con el driver `pg`
- Implementado en `PostgresUserRepository.ts`

## 2. Prisma ORM (Nuevo)

- Utiliza Prisma como ORM para PostgreSQL
- Implementado en `PrismaUserRepository.ts`
- **Usa la misma base de datos que el repositorio directo**

## Configuración de Variables de Entorno

### Archivo Principal (.env)

```bash
# Tipo de repositorio a usar: 'postgres' (SQL directo) | 'prisma' (ORM)
DB_TYPE=postgres

# URL de PostgreSQL (usada por ambos repositorios)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fracttal_db

PORT=3000
```

### Archivos de Configuración Específicos

#### Para PostgreSQL Directo (.env.postgres)

```bash
DB_TYPE=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fracttal_db
PORT=3000
```

#### Para Prisma ORM (.env.prisma)

```bash
DB_TYPE=prisma
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fracttal_db
PORT=3000
```

## Comandos Disponibles

### Scripts de Prisma

```bash
# Generar cliente de Prisma
npm run prisma:generate

# Ejecutar migraciones en desarrollo
npm run prisma:migrate

# Desplegar migraciones en producción
npm run prisma:deploy

# Resetear base de datos
npm run prisma:reset

# Abrir Prisma Studio
npm run prisma:studio
```

### Scripts de PostgreSQL (existentes)

```bash
# Crear nueva migración
npm run migrate:create

# Ejecutar migraciones
npm run migrate:up

# Revertir migraciones
npm run migrate:down
```

## Cambio entre Repositorios

Para cambiar entre PostgreSQL directo y Prisma, simplemente modifica la variable `DB_TYPE` en tu archivo `.env`:

```bash
# Para usar PostgreSQL directo
DB_TYPE=postgres

# Para usar Prisma
DB_TYPE=prisma
```

O copia el archivo de configuración correspondiente:

```bash
# Para PostgreSQL
cp .env.postgres .env

# Para Prisma
cp .env.prisma .env
```

## Configuración de Base de Datos

### Para PostgreSQL Directo

1. Asegúrate de que PostgreSQL esté ejecutándose
2. Crea la base de datos: `fracttal_db`
3. Ejecuta las migraciones existentes: `npm run migrate:up`

### Para Prisma

1. Asegúrate de que PostgreSQL esté ejecutándose
2. Crea la base de datos: `fracttal_db_prisma`
3. Ejecuta las migraciones de Prisma: `npm run prisma:migrate`
4. Genera el cliente: `npm run prisma:generate`

## Estructura del Proyecto

```bash
src/
├── lib/
│   ├── User/
│   │   ├── infrastructure/
│   │   │   ├── PostgresUserRepository.ts  # Repositorio PostgreSQL directo
│   │   │   └── PrismaUserRepository.ts    # Repositorio Prisma
│   │   └── domain/
│   │       └── UserRepository.ts          # Interfaz común
│   └── Shared/
│       └── infrastructure/
│           └── ServiceContainer.ts        # Factory para seleccionar repositorio
├── generated/
│   └── prisma/                           # Cliente generado de Prisma
└── ...

prisma/
├── schema.prisma                         # Esquema de Prisma
└── migrations/                           # Migraciones de Prisma
```

## Notas Importantes

1. **Compatibilidad**: Ambos repositorios implementan la misma interfaz `UserRepository`, garantizando compatibilidad total.

2. **Migraciones**: Las migraciones de Prisma y PostgreSQL son independientes. Asegúrate de usar las correctas según el tipo de repositorio.

3. **Conexiones**: El `PrismaUserRepository` incluye un método `disconnect()` para cerrar conexiones cuando sea necesario.
