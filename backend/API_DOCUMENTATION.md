# 📖 Poke Price Tracker - API Documentation

API REST para seguimiento de precios de cartas Pokémon TCG con agregación de múltiples fuentes (TCGPlayer y Cardmarket).

---

## 🔧 Configuración

### Variables de Entorno (.env)

```env
# Database (Supabase PostgreSQL)
DB_HOST=aws-0-eu-central-1.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.xxxxx
DB_PASSWORD=your_password

# APIs externas
POKEMON_TCG_API_KEY=your_tcgplayer_key
POKEMON_TCG_API_URL=https://api.pokemontcg.io/v2
TCGDEX_API_URL=https://api.tcgdex.net/v2/en

# Servidor
PORT=3000
NODE_ENV=development
```

### Iniciar servidor

```bash
npm install
npm run dev  # Modo desarrollo con nodemon
npm start    # Producción
npm test     # Tests con cobertura
```

---

## 📚 Endpoints

### Base URL

```
http://localhost:3000/api
```

---

## 🃏 Cards (Cartas)

### 1. Obtener todas las cartas

```http
GET /api/cards
```

**Query Parameters:**

- `limit` (number, opcional): Número de resultados (1-100, default: 20)
- `offset` (number, opcional): Offset para paginación (default: 0)
- `sortBy` (string, opcional): Campo de ordenación (`name`, `number`, `rarity`, `release_date`, `last_price_usd`, `last_price_eur`)
- `sortOrder` (string, opcional): Dirección de ordenación (`asc`, `desc`, default: `asc`)

**Ejemplo:**

```bash
curl "http://localhost:3000/api/cards?limit=10&sortBy=last_price_usd&sortOrder=desc"
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "base1-4",
      "name": "Charizard",
      "supertype": "Pokémon",
      "subtypes": ["Stage 2"],
      "number": "4",
      "rarity": "Rare Holo",
      "set_id": "base1",
      "set_name": "Base Set",
      "release_date": "1999-01-09",
      "last_price_usd": 450.5,
      "last_price_eur": 410.0,
      "image_url": "https://images.pokemontcg.io/base1/4_hires.png"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 1524
  }
}
```

---

### 2. Buscar cartas por nombre

```http
GET /api/cards/search
```

**Query Parameters:**

- `q` | `name` | `search` (string, requerido): Término de búsqueda (2-100 caracteres)
- `limit` (number, opcional): Límite de resultados (default: 20)
- `offset` (number, opcional): Offset (default: 0)

**Ejemplo:**

```bash
curl "http://localhost:3000/api/cards/search?q=pikachu&limit=5"
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "base1-58",
      "name": "Pikachu",
      "set_name": "Base Set",
      "last_price_usd": 15.0,
      "last_price_eur": 13.5
    }
  ],
  "count": 142,
  "_cached": true
}
```

---

### 3. Filtrar cartas con múltiples criterios

```http
GET /api/cards/filter
```

**Query Parameters:**

- `name` (string): Búsqueda parcial por nombre
- `setId` (string): ID del set (ej: `base1`)
- `supertype` (string): Tipo superior (`Pokémon`, `Trainer`, `Energy`)
- `rarity` (string): Rareza (`Common`, `Uncommon`, `Rare`, `Rare Holo`, etc.)
- `minPrice` (number): Precio mínimo en EUR
- `maxPrice` (number): Precio máximo en EUR
- `currency` (string): Moneda para filtro de precio (`usd`, `eur`)
- `limit` (number): Límite (default: 20)
- `offset` (number): Offset (default: 0)

**Ejemplo:**

```bash
curl "http://localhost:3000/api/cards/filter?supertype=Pokémon&rarity=Rare%20Holo&minPrice=50&maxPrice=500&currency=usd"
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "base1-4",
      "name": "Charizard",
      "rarity": "Rare Holo",
      "last_price_usd": 450.5
    }
  ],
  "filters": {
    "supertype": "Pokémon",
    "rarity": "Rare Holo",
    "minPrice": 50,
    "maxPrice": 500,
    "currency": "usd"
  },
  "count": 24
}
```

---

### 4. Obtener carta por ID

```http
GET /api/cards/:id
```

**Path Parameters:**

- `id` (string): ID de la carta (formato: `setId-number`, ej: `base1-4`)

**Ejemplo:**

```bash
curl "http://localhost:3000/api/cards/base1-4"
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "base1-4",
    "name": "Charizard",
    "supertype": "Pokémon",
    "subtypes": ["Stage 2"],
    "hp": "120",
    "types": ["Fire"],
    "evolves_from": "Charmeleon",
    "number": "4",
    "artist": "Mitsuhiro Arita",
    "rarity": "Rare Holo",
    "set_id": "base1",
    "set_name": "Base Set",
    "set_series": "Base",
    "release_date": "1999-01-09",
    "image_url": "https://images.pokemontcg.io/base1/4_hires.png",
    "tcgplayer_url": "https://prices.tcgplayer.com/pokemon/base-set/charizard-4",
    "last_price_usd": 450.5,
    "last_price_eur": 410.0,
    "last_update": "2026-02-02T10:30:00Z"
  }
}
```

**Error (404 Not Found):**

```json
{
  "success": false,
  "error": "Carta no encontrada"
}
```

---

### 5. Obtener estadísticas de una carta

```http
GET /api/cards/:id/stats
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "data": {
    "card_id": "base1-4",
    "current_price_usd": 450.5,
    "current_price_eur": 410.0,
    "avg_price_30d_usd": 425.0,
    "avg_price_30d_eur": 387.0,
    "min_price_30d_usd": 380.0,
    "max_price_30d_usd": 490.0,
    "price_change_7d": "+5.2%",
    "price_change_30d": "+12.8%",
    "volatility": "medium"
  }
}
```

---

## 📦 Sets (Colecciones)

### 1. Obtener todos los sets

```http
GET /api/sets
```

**Query Parameters:**

- `limit` (number): Límite de resultados (default: 20)
- `offset` (number): Offset (default: 0)
- `includeTotals` (boolean): Incluir totales de cartas (default: true)

**Ejemplo:**

```bash
curl "http://localhost:3000/api/sets?limit=5"
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "base1",
      "name": "Base Set",
      "series": "Base",
      "release_date": "1999-01-09",
      "total": 102,
      "logo_url": "https://images.pokemontcg.io/base1/logo.png",
      "symbol_url": "https://images.pokemontcg.io/base1/symbol.png",
      "cards_count": 102,
      "avg_price_usd": 12.5
    }
  ],
  "pagination": {
    "limit": 5,
    "offset": 0,
    "total": 145
  }
}
```

---

### 2. Obtener set por ID

```http
GET /api/sets/:setId
```

**Query Parameters:**

- `includeCards` (boolean): Incluir todas las cartas del set (default: false)

**Ejemplo:**

```bash
curl "http://localhost:3000/api/sets/base1?includeCards=true"
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "base1",
    "name": "Base Set",
    "series": "Base",
    "release_date": "1999-01-09",
    "total": 102,
    "cards": [
      {
        "id": "base1-1",
        "name": "Alakazam",
        "number": "1"
      }
    ]
  }
}
```

---

### 3. Obtener estadísticas del set

```http
GET /api/sets/:setId/stats
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "data": {
    "set_id": "base1",
    "total_cards": 102,
    "avg_price_usd": 12.5,
    "avg_price_eur": 11.3,
    "max_price_usd": 450.5,
    "min_price_usd": 0.5,
    "cards_with_price": 98,
    "cards_without_price": 4,
    "rarity_distribution": {
      "Common": 32,
      "Uncommon": 31,
      "Rare": 23,
      "Rare Holo": 16
    }
  }
}
```

---

### 4. Listar series únicas

```http
GET /api/sets/series
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "data": ["Base", "Gym", "Neo", "Legendary Collection", "Sword & Shield"]
}
```

---

### 5. Obtener sets por serie

```http
GET /api/sets/series/:name
```

**Ejemplo:**

```bash
curl "http://localhost:3000/api/sets/series/Base"
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "base1",
      "name": "Base Set",
      "series": "Base",
      "release_date": "1999-01-09"
    },
    {
      "id": "base2",
      "name": "Jungle",
      "series": "Base",
      "release_date": "1999-06-16"
    }
  ]
}
```

---

## 💰 Prices (Precios)

### 1. Obtener historial de precios

```http
GET /api/prices/history/:cardId
```

**Query Parameters:**

- `period` (string): Período de tiempo (`24h`, `7d`, `30d`, `1y`, default: `30d`)
- `currency` (string): Moneda (`usd`, `eur`, `both`, default: `both`)

**Ejemplo:**

```bash
curl "http://localhost:3000/api/prices/history/base1-4?period=7d&currency=usd"
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "data": {
    "card_id": "base1-4",
    "period": "7d",
    "currency": "usd",
    "prices": [
      {
        "date": "2026-01-26",
        "price_usd": 430.0,
        "source": "aggregated"
      },
      {
        "date": "2026-01-27",
        "price_usd": 435.0,
        "source": "aggregated"
      }
    ],
    "stats": {
      "current": 450.5,
      "min": 430.0,
      "max": 455.0,
      "avg": 442.5,
      "change": "+4.8%"
    }
  }
}
```

---

### 2. Obtener tendencia de precio

```http
GET /api/prices/trend/:cardId
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "data": {
    "card_id": "base1-4",
    "trend_7d": "up",
    "trend_30d": "stable",
    "momentum": "bullish",
    "support_level": 420.0,
    "resistance_level": 480.0
  }
}
```

---

### 3. Actualizar precio de carta (TCGPlayer)

```http
POST /api/prices/update/:cardId
```

**Ejemplo:**

```bash
curl -X POST "http://localhost:3000/api/prices/update/base1-4"
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "message": "Precio actualizado",
  "data": {
    "card_id": "base1-4",
    "price_usd": 450.5,
    "price_eur": 410.0,
    "source": "tcgplayer",
    "updated_at": "2026-02-02T10:30:00Z"
  }
}
```

---

### 4. Actualizar precio agregado (Múltiples fuentes)

```http
POST /api/prices/update-aggregated/:cardId
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "data": {
    "card_id": "base1-4",
    "average_price_usd": 450.5,
    "average_price_eur": 410.0,
    "sources": [
      {
        "source": "tcgplayer",
        "price_usd": 455.0,
        "price_eur": 413.64
      },
      {
        "source": "cardmarket",
        "price_eur": 406.5,
        "price_usd": 447.15
      }
    ],
    "source_count": 2,
    "updated_at": "2026-02-02T10:30:00Z"
  }
}
```

---

### 5. Obtener estadísticas de cartas sin precio

```http
GET /api/prices/without-price-stats
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "data": {
    "total_cards": 156,
    "first_attempt": 45,
    "few_attempts": 78,
    "many_attempts": 33,
    "avg_attempts": 2.8
  }
}
```

---

## 🔄 Sync (Sincronización)

### 1. Sincronizar todos los sets

```http
POST /api/sync/sets
```

**Respuesta (202 Accepted):**

```json
{
  "success": true,
  "message": "Sincronización de sets iniciada",
  "taskId": "sync-sets-1234567890"
}
```

---

### 2. Sincronizar cartas de un set

```http
POST /api/sync/cards/:setId
```

**Ejemplo:**

```bash
curl -X POST "http://localhost:3000/api/sync/cards/base1"
```

**Respuesta (200 OK):**

```json
{
  "success": true,
  "message": "102 cartas sincronizadas",
  "set_id": "base1",
  "cards_added": 0,
  "cards_updated": 102
}
```

---

### 3. Sincronizar precios faltantes

```http
POST /api/sync/prices-missing
```

**Query Parameters:**

- `limit` (number): Límite de cartas a procesar (default: 100)

**Respuesta (202 Accepted):**

```json
{
  "success": true,
  "message": "Sincronización de precios iniciada",
  "total": 245,
  "estimated_time": "12 minutos"
}
```

---

### 4. Sincronizar todos los precios

```http
POST /api/sync/prices-all
```

⚠️ **Advertencia:** Proceso intensivo. Usar con moderación.

**Respuesta (202 Accepted):**

```json
{
  "success": true,
  "message": "Sincronización completa iniciada",
  "total_cards": 1524,
  "estimated_time": "2 horas"
}
```

---

## 🔐 Rate Limiting

Todos los endpoints tienen límites de uso para proteger la API:

| Tipo de Endpoint | Límite       | Ventana    |
| ---------------- | ------------ | ---------- |
| General          | 100 requests | 15 minutos |
| Búsqueda         | 50 requests  | 5 minutos  |
| Sincronización   | 10 requests  | 1 hora     |
| Actualización    | 30 requests  | 5 minutos  |

**Headers de respuesta:**

```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1675345200
```

**Error (429 Too Many Requests):**

```json
{
  "success": false,
  "error": "Too many requests",
  "retry_after": 300
}
```

---

## 💾 Cache

La API implementa cache en 3 niveles:

| Cache | TTL    | Endpoints                   |
| ----- | ------ | --------------------------- |
| Corta | 5 min  | Búsquedas, filtros          |
| Media | 30 min | Detalles de cartas, precios |
| Larga | 1 hora | Sets, series, estadísticas  |

**Header de respuesta cacheada:**

```json
{
  "success": true,
  "data": {...},
  "_cached": true,
  "_cache_age": 180
}
```

---

## ⚠️ Manejo de Errores

### Códigos de Estado

- `200 OK` - Petición exitosa
- `201 Created` - Recurso creado
- `202 Accepted` - Proceso aceptado (asíncrono)
- `400 Bad Request` - Parámetros inválidos
- `404 Not Found` - Recurso no encontrado
- `409 Conflict` - Conflicto (recurso duplicado)
- `429 Too Many Requests` - Límite de rate excedido
- `500 Internal Server Error` - Error del servidor

### Formato de Error

```json
{
  "success": false,
  "error": "Mensaje descriptivo del error",
  "code": "ERROR_CODE",
  "details": {
    "field": "cardId",
    "message": "Formato de ID inválido"
  }
}
```

### Validaciones Comunes

**Formato de Card ID:**

```
✅ base1-4
✅ xy1-10
❌ base14 (sin guión)
❌ base1-abc (número inválido)
```

**Rango de precios:**

```
✅ minPrice=0, maxPrice=1000
❌ minPrice=-10 (negativo)
❌ minPrice=100, maxPrice=50 (min > max)
```

**Búsqueda:**

```
✅ q=pikachu (2-100 caracteres)
❌ q=a (muy corto)
❌ q=<101 caracteres> (muy largo)
```

---

## 🤖 Tareas Programadas (Cron Jobs)

El sistema ejecuta sincronizaciones automáticas:

| Tarea               | Frecuencia             | Descripción                  |
| ------------------- | ---------------------- | ---------------------------- |
| Sync Sets           | Diaria 3:00 AM         | Sincroniza nuevos sets       |
| Sync Cards          | Cada 12h               | Actualiza cartas existentes  |
| Hot Prices          | Cada hora              | Top 50 cartas populares      |
| Normal Prices       | Cada 6h                | 100 cartas aleatorias        |
| Retry Without Price | Semanal (Domingo 4 AM) | Reintentar cartas sin precio |

---

## 📊 Ejemplos de Uso

### Flujo típico: Consultar precio de carta

```bash
# 1. Buscar carta por nombre
curl "http://localhost:3000/api/cards/search?q=charizard"

# 2. Obtener detalles completos
curl "http://localhost:3000/api/cards/base1-4"

# 3. Ver historial de precios
curl "http://localhost:3000/api/prices/history/base1-4?period=30d"

# 4. Actualizar precio si es necesario
curl -X POST "http://localhost:3000/api/prices/update-aggregated/base1-4"
```

### Flujo: Explorar colección

```bash
# 1. Listar todas las series
curl "http://localhost:3000/api/sets/series"

# 2. Ver sets de una serie
curl "http://localhost:3000/api/sets/series/Base"

# 3. Ver detalles del set
curl "http://localhost:3000/api/sets/base1?includeCards=true"

# 4. Estadísticas del set
curl "http://localhost:3000/api/sets/base1/stats"
```

### Flujo: Filtrado avanzado

```bash
# Cartas Pokémon raras de más de $100
curl "http://localhost:3000/api/cards/filter?supertype=Pokémon&rarity=Rare%20Holo&minPrice=100&currency=usd&sortBy=last_price_usd&sortOrder=desc"
```

---

## 🧪 Testing

```bash
# Todos los tests con cobertura
npm test

# Solo tests unitarios
npm run test:unit

# Solo tests de integración
npm run test:integration

# Watch mode
npm run test:watch
```

---

## 📝 Notas Adicionales

### Agregación de Precios

El sistema consulta **2 fuentes** simultáneamente:

- **TCGPlayer** (USD) - Mercado estadounidense
- **Cardmarket** (EUR) - Mercado europeo

El precio agregado es el **promedio ponderado** con conversión de moneda automática.

### Cartas sin Precio

Las cartas que fallan en obtener precio son marcadas y reintentadas después de 30 días para evitar sobrecarga de APIs.

### Cache Invalidation

El cache se invalida automáticamente cuando:

- Se actualiza un precio
- Se sincroniza una carta
- Se añade/modifica un set

---

## 🛠️ Herramientas de Desarrollo

### Admin Endpoints

```http
GET /api/admin/health
GET /api/admin/cache/stats
GET /api/admin/scheduler/status
POST /api/admin/cache/clear
```

### Logs

```bash
# Ver logs en tiempo real
npm run dev

# Logs de tareas programadas
tail -f logs/scheduler.log
```

---

## 📞 Contacto y Soporte

Para reportar problemas o sugerencias, consultar el repositorio del proyecto.

---

**Versión:** 1.0.0  
**Última actualización:** 2 Febrero 2026
