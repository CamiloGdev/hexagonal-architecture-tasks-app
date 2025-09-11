# Guía de Autenticación JWT - Proyecto Fracttal

## 📋 Resumen del Sistema

Este proyecto implementa un sistema de autenticación JWT con cookies HttpOnly siguiendo arquitectura hexagonal. El sistema utiliza dos tipos de tokens:

- **Access Token**: Duración corta (15 minutos) - Para autenticación de peticiones
- **Refresh Token**: Duración larga (7 días) - Para renovar access tokens

## 🔗 Endpoints Disponibles

### Autenticación

#### `POST /api/auth/register`

Registra un nuevo usuario y establece cookies de sesión.

**Request:**

```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123"
}
```

**Response (201):**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "name": "Juan Pérez",
    "email": "juan@example.com"
  }
}
```

#### `POST /api/auth/login`

Autentica un usuario existente y establece cookies de sesión.

**Request:**

```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "name": "Juan Pérez",
    "email": "juan@example.com"
  }
}
```

#### `POST /api/auth/refresh`

Renueva el access token usando el refresh token.

**Request:** No requiere body (usa cookies automáticamente)

**Response (200):**

```json
{
  "message": "Access token refreshed"
}
```

**Errores comunes:**

- `401`: Refresh token no encontrado
- `403`: Refresh token inválido o expirado

#### `POST /api/auth/logout`

Cierra la sesión limpiando las cookies del cliente.

**Request:** No requiere body

**Response (200):**

```json
{
  "message": "Logout successful"
}
```

### Rutas Protegidas

Las siguientes rutas requieren autenticación (access token válido):

- `PUT /api/users/:id` - Actualizar usuario completo
- `PATCH /api/users/:id` - Actualizar usuario parcial

## 🍪 Manejo de Cookies

### Cookies Establecidas

1. **accessToken**
   - Path: `/api`
   - HttpOnly: true
   - Secure: true (solo en producción)
   - SameSite: strict
   - MaxAge: 15 minutos

2. **refreshToken**
   - Path: `/api/auth/refresh`
   - HttpOnly: true
   - Secure: true (solo en producción)
   - SameSite: strict
   - MaxAge: 7 días

### Configuración de Cookies

Las cookies se configuran automáticamente según el entorno:

- **Desarrollo**: `secure: false` (permite HTTP)
- **Producción**: `secure: true` (requiere HTTPS)

## 🔄 Flujo de Refresh Token

### ¿Cuándo usar el refresh endpoint?

El refresh token se debe usar cuando:

1. **Access token expira**: El cliente recibe un error 403 en una petición protegida
2. **Refresh proactivo**: Antes de que expire (recomendado a los 10-12 minutos)

### Implementación en el Cliente

```javascript
// Ejemplo de manejo automático de refresh
async function makeAuthenticatedRequest(url, options = {}) {
  try {
    // Intenta la petición normal
    const response = await fetch(url, {
      ...options,
      credentials: 'include' // Incluye cookies automáticamente
    });

    if (response.status === 403) {
      // Access token expirado, intenta refresh
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });

      if (refreshResponse.ok) {
        // Retry la petición original
        return fetch(url, {
          ...options,
          credentials: 'include'
        });
      } else {
        // Refresh falló, redirigir a login
        window.location.href = '/login';
      }
    }

    return response;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}
```

### Refresh Automático con Interceptor (Axios)

```javascript
import axios from 'axios';

// Configurar axios para incluir cookies
axios.defaults.withCredentials = true;

// Interceptor para manejo automático de refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post('/api/auth/refresh');
        return axios(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

## 🛡️ Seguridad

### Cookies HttpOnly

- Las cookies no son accesibles desde JavaScript del cliente
- Previene ataques XSS (Cross-Site Scripting)
- Los tokens se envían automáticamente en cada petición

### SameSite Strict

- Previene ataques CSRF (Cross-Site Request Forgery)
- Las cookies solo se envían desde el mismo dominio

### Tiempos de Expiración

- **Access Token corto**: Limita el daño si es comprometido
- **Refresh Token largo**: Mejor experiencia de usuario

## ⚙️ Variables de Entorno

```bash
# JWT Secrets (usar valores seguros en producción)
JWT_ACCESS_SECRET="tu_super_secreto_para_access_token_aqui"
JWT_REFRESH_SECRET="tu_otro_super_secreto_para_refresh_token_aqui"

# JWT Expiration Times
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# Cookie Expiration Times (en segundos)
COOKIE_ACCESS_EXPIRATION=900    # 15 minutos
COOKIE_REFRESH_EXPIRATION=604800 # 7 días
```

## 🔍 Debugging

### Verificar Cookies en el Navegador

1. Abrir DevTools → Application → Cookies
2. Buscar `accessToken` y `refreshToken`
3. Verificar que tengan `HttpOnly: true`

### Logs del Servidor

El servidor logea automáticamente:

- Errores de autenticación
- Tokens inválidos o expirados
- Intentos de acceso no autorizados

### Errores Comunes

| Error | Código | Descripción | Solución |
|-------|--------|-------------|----------|
| `Authentication required: No token provided` | 401 | No hay access token | Login requerido |
| `Invalid or expired token` | 403 | Access token inválido | Usar refresh endpoint |
| `Refresh token not found` | 401 | No hay refresh token | Login requerido |
| `Invalid refresh token` | 403 | Refresh token inválido | Login requerido |

## 📝 Notas Importantes

1. **No almacenar tokens en localStorage**: Las cookies HttpOnly son más seguras
2. **Manejar refresh automáticamente**: Implementar interceptores para mejor UX
3. **Logout siempre**: Usar el endpoint de logout para limpiar cookies
4. **HTTPS en producción**: Requerido para cookies seguras
5. **Secretos seguros**: Usar generadores de contraseñas para JWT secrets
