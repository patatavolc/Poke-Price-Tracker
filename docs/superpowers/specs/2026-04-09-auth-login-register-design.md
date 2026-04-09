# Auth: Login, Registro y Botón de Sesión en Navbar

**Fecha:** 2026-04-09  
**Estado:** Aprobado

---

## Resumen

Implementar un sistema de autenticación client-side completo: contexto global de sesión, páginas de login y registro, botón de sesión en el Navbar, y mejora del mensaje de no-autenticado en pack-opener.

El backend ya tiene los endpoints necesarios (`POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`) con JWT. El token se almacena en `localStorage`.

---

## Arquitectura

### AuthContext (`frontend/src/context/AuthContext.jsx`)

- `AuthProvider` envuelve la app en `layout.jsx`
- Al montar, lee `localStorage` para recuperar token y datos del usuario persistidos
- Expone: `user`, `login(token, userData)`, `logout()`
- `login()`: guarda token y userData en `localStorage`, actualiza estado
- `logout()`: limpia `localStorage`, resetea estado a `null`

### API de auth (`frontend/src/lib/api/auth.js`)

Dos funciones:
- `loginUser({ username, password })` → `POST /api/auth/login` → devuelve `{ user, token }`
- `registerUser({ username, password, name })` → `POST /api/auth/register` → devuelve `{ user, token }`

---

## Componentes y Páginas

### Página de Login (`frontend/src/app/login/page.jsx`)

- Formulario: campos `usuario` y `contraseña`
- Submit: llama a `loginUser()`, invoca `login()` del contexto, redirige
- Lógica de redirección post-login:
  1. Si hay query param `?from=<ruta>`, redirige a esa ruta
  2. Si no, `router.back()`
  3. Fallback: `/pack-opener`
- Enlace a `/registro` para nuevos usuarios
- Muestra error si las credenciales son incorrectas

### Página de Registro (`frontend/src/app/registro/page.jsx`)

- Formulario: campos `nombre`, `usuario` y `contraseña`
- Submit: llama a `registerUser()`, invoca `login()` del contexto (login automático), redirige con la misma lógica que login
- Enlace a `/login` para usuarios existentes
- Muestra error si el usuario ya existe u otro error del servidor

### Navbar (`frontend/src/components/common/Navbar.jsx`)

- Pasa a `"use client"` para consumir `AuthContext`
- Si **no hay sesión**: botón "Iniciar sesión" → enlaza a `/login?from=<pathname actual>`
- Si **hay sesión**: muestra el `username` del usuario y botón "Cerrar sesión" que llama a `logout()`

### Pack-opener (`frontend/src/app/pack-opener/page.jsx`)

- El bloque `notAuth` existente: cambiar el enlace "Ir al inicio" por un botón que enlaza a `/login?from=/pack-opener`
- Sin otros cambios en la lógica

---

## Flujo de redirección

```
Usuario no autenticado visita /pack-opener
  → Ve mensaje + botón "Iniciar sesión"
  → Hace click → va a /login?from=/pack-opener
  → Completa el formulario
  → Login exitoso → redirige a /pack-opener

Usuario hace click en "Iniciar sesión" desde el Navbar estando en /market
  → Va a /login?from=/market
  → Login exitoso → redirige a /market

Usuario hace click en "Iniciar sesión" desde el Navbar sin página previa clara
  → Fallback a /pack-opener
```

---

## Archivos a crear/modificar

| Acción | Archivo |
|--------|---------|
| Crear | `frontend/src/context/AuthContext.jsx` |
| Crear | `frontend/src/lib/api/auth.js` |
| Crear | `frontend/src/app/login/page.jsx` |
| Crear | `frontend/src/app/registro/page.jsx` |
| Modificar | `frontend/src/app/layout.jsx` (añadir `AuthProvider`) |
| Modificar | `frontend/src/components/common/Navbar.jsx` (añadir estado sesión) |
| Modificar | `frontend/src/app/pack-opener/page.jsx` (mejorar botón notAuth) |

---

## Fuera de alcance

- Middleware de Next.js para protección server-side de rutas (requeriría mover el token a cookies)
- Página de perfil/edición de usuario
- Recuperación de contraseña
