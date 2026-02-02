# 📚 API Documentation - Poke Price Tracker

**Versión:** 1.0.0  
**Base URL:** `http://localhost:3000/api`  
**Última actualización:** 2 Febrero 2026

---

## 📋 Tabla de Contenidos

- [Configuración](#-configuración)
- [Sincronización](#-sincronización)
- [Cartas](#-cartas)
- [Sets](#-sets)
- [Precios](#-precios)
- [Rate Limiting](#-rate-limiting)
- [Cache](#-cache)
- [Códigos de Error](#️-manejo-de-errores)
- [Ejemplos de Uso](#-ejemplos-de-uso)

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

### Iniciar Servidor

```bash
npm install
npm run dev  # Modo desarrollo con nodemon
npm start    # Producción
```

---

## 🔄 Sincronización

### Sincronizar Sets

Obtiene y guarda todos los sets de cartas desde la API de Pokemon TCG.

**Endpoint:** `GET /api/sync/sets`

**Rate Limit:** 10 requests/hora

**Respuesta (200 OK):**

```json
{
  "message": "Sets sincronizados correctamente",
  "count": 150
}
```

**Ejemplo:**

```bash
curl http://localhost:3000/api/sync/sets
```

---

### Sincronizar Cartas de un Set

Sincroniza todas las cartas de un set específico.

**Endpoint:** `GET /api/sync/cards/:setId`

**Parámetros URL:**

| Parámetro | Tipo   | Requerido | Descripción              |
| --------- | ------ | --------- | ------------------------ |
| `setId`   | string | Sí        | ID del set (ej: "base1") |

**Validación:** `^[a-z0-9]+$`

**Respuesta (200 OK):**

```json
{
  "message": "Cartas del set base1 sincronizadas",
  "count": 102
}
```

**Ejemplo:**

```bash
curl -X POST http://localhost:3000/api/sync/cards/base1
```

---

### Sincronizar Todas las Cartas

Inicia la sincronización masiva en segundo plano.

**Endpoint:** `GET /api/sync/all-cards`

**Respuesta (202 Accepted):**

```json
{
  "message": "Sincronización masiva iniciada en segundo plano"
}
```

---

### Sincronizar Precios Faltantes

Sincroniza solo las cartas que no tienen precio.

**Endpoint:** `GET /api/sync/missing-prices`

**Respuesta (202 Accepted):**

```json
{
  "message": "Sincronizacion de precios faltantes iniciada"
}
```

---

## 🃏 Cartas

### Buscar Cartas

Busca cartas por nombre usando coincidencia parcial.

**Endpoint:** `GET /api/cards/search`

**Query Parameters:**

| Parámetro | Tipo    | Requerido | Descripción          | Default |
| --------- | ------- | --------- | -------------------- | ------- |
| `q`       | string  | Sí        | Término de búsqueda  | -       |
| `limit`   | integer | No        | Límite de resultados | 20      |
| `offset`  | integer | No        | Offset paginación    | 0       |

**Validación:**

- `q` debe tener mínimo 2 caracteres y máximo 100
- `limit` entre 1 y 100
- `offset` >= 0

**Rate Limit:** 50 requests/5 minutos

**Respuesta (200 OK):**

```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id": "base1-4",
      "name": "Charizard",
      "image_small": "https://...",
      "rarity": "Rare Holo",
      "last_price_eur": 450.0,
      "last_price_usd": 495.0,
      "set_name": "Base Set"
    }
  ]
}
```

**Ejemplo:**

```bash
curl "http://localhost:3000/api/cards/search?q=pikachu&limit=10"
```

---

### Filtrar Cartas

Filtra cartas por múltiples criterios combinados.

**Endpoint:** `GET /api/cards/filter`

**Query Parameters:**

| Parámetro   | Tipo    | Descripción                   |
| ----------- | ------- | ----------------------------- |
| `name`      | string  | Nombre (parcial)              |
| `setId`     | string  | ID del set                    |
| `rarity`    | string  | Rareza                        |
| `supertype` | string  | Supertipo (Pokémon, Trainer)  |
| `types`     | string  | Tipos separados por coma      |
| `artist`    | string  | Nombre del artista            |
| `minPrice`  | float   | Precio mínimo                 |
| `maxPrice`  | float   | Precio máximo                 |
| `currency`  | string  | Moneda (`eur` o `usd`)        |
| `limit`     | integer | Límite (max 100)              |
| `offset`    | integer | Offset paginación             |

**Validación:**

- `minPrice` >= 0
- `maxPrice` >= minPrice
- `currency` debe ser `eur` o `usd`

**Respuesta (200 OK):**

```json
{
  "success": true,
  "count": 25,
  "filters": {
    "rarity": "Rare Holo",
    "minPrice": 10,
    "maxPrice": 100,
    "currency": "eur"
  },
  "data": [
    {
      "id": "xy1-1",
      "name": "Venusaur EX",
      "rarity": "Rare Holo EX",
      "last_price_eur": 45.5
    }
  ]
}
```

**Ejemplo:**

```bash
curl "http://localhost:3000/api/cards/filter?rarity=Rare&minPrice=10&maxPrice=50&currency=eur"
```

---

### Obtener Detalles de Carta

Información completa de una carta incluyendo historial de precios.

**Endpoint:** `GET /api/cards/:id`

**Parámetros URL:**

| Parámetro | Tipo   | Requerido | Descripción                    |
| --------- | ------ | --------- | ------------------------------ |
| `id`      | string | Sí        | ID de la carta (ej: "base1-4") |

**Validación:** Formato `setId-number` (regex: `^[a-z0-9]+-[0-9]+$`)

**Respuesta (200 OK):**

```json
{
  "id": "base1-4",
  "name": "Charizard",
  "supertype": "Pokémon",
  "subtypes": ["Stage 2"],
  "types": ["Fire"],
  "rarity": "Rare Holo",
  "artist": "Mitsuhiro Arita",
  "image_small": "https://...",
  "image_large": "https://...",
  "last_price_eur": 450.0,
  "last_price_usd": 495.0,
  "set": {
    "id": "base1",
    "name": "Base Set",
    "series": "Base",
    "release_date": "1999-01-09"
  },
  "priceHistory": [
    {
      "price_eur": 420.0,
      "price_usd": 462.0,
      "source": "aggregated",
      "created_at": "2026-01-14T10:00:00Z"
    }
  ]
}
```

**Errores:**

```json
// 400 - Formato inválido
{
  "error": "Formato de ID de carta inválido",
  "example": "base1-4"
}

// 404 - No encontrada
{
  "error": "Carta no encontrada"
}
```

---

### Cartas Más Caras

**Endpoint:** `GET /api/cards/expensive`

**Query Parameters:**

| Parámetro  | Tipo    | Default | Descripción            |
| ---------- | ------- | ------- | ---------------------- |
| `limit`    | integer | 20      | Cantidad de resultados |
| `currency` | string  | `eur`   | Moneda (`eur`, `usd`)  |

**Respuesta (200 OK):**

```json
[
  {
    "id": "base1-4",
    "name": "Charizard",
    "image_small": "https://...",
    "rarity": "Rare Holo",
    "last_price_eur": 450.0,
    "set_name": "Base Set"
  }
]
```

---

### Cartas Más Baratas

**Endpoint:** `GET /api/cards/cheap`

Similar a `/expensive` pero ordenadas ascendentemente.

---

### Tendencias de Precio (Subidas)

**Endpoint:** `GET /api/cards/trending/price-increase`

**Query Parameters:**

| Parámetro | Tipo   | Default | Valores     |
| --------- | ------ | ------- | ----------- |
| `period`  | string | `24h`   | `24h`, `7d` |

**Respuesta (200 OK):**

```json
[
  {
    "id": "swsh12-186",
    "name": "Giratina VSTAR",
    "last_price_eur": 85.0,
    "old_price_eur": 65.0,
    "change_percentage_eur": 30.77
  }
]
```

---

### Tendencias de Precio (Bajadas)

**Endpoint:** `GET /api/cards/trending/price-decrease`

Similar a `/price-increase` pero con cambios negativos.

---

### Comparar Precios

**Endpoint:** `GET /api/cards/compare`

**Query Parameters:**

| Parámetro | Tipo   | Requerido | Descripción                     |
| --------- | ------ | --------- | ------------------------------- |
| `ids`     | string | Sí        | IDs separados por coma (max 10) |

**Validación:** Mínimo 2 cartas, máximo 10

**Respuesta (200 OK):**

```json
[
  {
    "id": "base1-4",
    "name": "Charizard",
    "last_price_eur": 450.0,
    "last_price_usd": 495.0
  },
  {
    "id": "base1-2",
    "name": "Blastoise",
    "last_price_eur": 280.0,
    "last_price_usd": 308.0
  }
]
```

**Ejemplo:**

```bash
curl "http://localhost:3000/api/cards/compare?ids=base1-4,base1-2,base1-15"
```

---

### Rango de Precios

**Endpoint:** `GET /api/cards/:id/price-range`

**Query Parameters:**

| Parámetro | Tipo    | Default | Descripción        |
| --------- | ------- | ------- | ------------------ |
| `days`    | integer | 30      | Días hacia atrás   |

**Respuesta (200 OK):**

```json
{
  "cardId": "base1-4",
  "name": "Charizard",
  "period_days": 30,
  "price_range_eur": {
    "min": 420.0,
    "max": 480.0,
    "avg": 445.5,
    "current": 450.0
  }
}
```

---

### Alerta de Precio

**Endpoint:** `GET /api/cards/:id/price-alert`

**Query Parameters:**

| Parámetro     | Tipo   | Requerido | Descripción                           |
| ------------- | ------ | --------- | ------------------------------------- |
| `targetPrice` | float  | Sí        | Precio objetivo                       |
| `condition`   | string | No        | `below`, `above`, `equals` (default: below) |
| `currency`    | string | No        | `eur`, `usd` (default: eur)           |

**Respuesta (200 OK):**

```json
{
  "alert": true,
  "message": "El precio actual (€420.00) está por debajo del objetivo (€450.00)",
  "currentPrice": 420.0,
  "targetPrice": 450.0,
  "currency": "eur"
}
```

---

### Cartas de un Set

**Endpoint:** `GET /api/cards/set/:set_id`

**Respuesta (200 OK):**

```json
[
  {
    "id": "base1-1",
    "name": "Alakazam",
    "last_price_eur": 45.0
  }
]
```

---

## 📦 Sets

### Listar Todos los Sets

**Endpoint:** `GET /api/sets`

**Query Parameters:**

| Parámetro | Tipo   | Default        | Valores                      |
| --------- | ------ | -------------- | ---------------------------- |
| `orderBy` | string | `release_date` | `release_date`, `name`, `series` |

**Respuesta (200 OK):**

```json
{
  "success": true,
  "count": 150,
  "data": [
    {
      "id": "base1",
      "name": "Base Set",
      "series": "Base",
      "total": 102,
      "release_date": "1999-01-09",
      "symbol_url": "https://...",
      "synced_cards": 102
    }
  ]
}
```

---

### Detalles de un Set

**Endpoint:** `GET /api/sets/:setId`

**Respuesta (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "base1",
    "name": "Base Set",
    "series": "Base",
    "total": 102,
    "cards": [
      {
        "id": "base1-1",
        "name": "Alakazam",
        "rarity": "Rare Holo"
      }
    ]
  }
}
```

---

### Estadísticas de un Set

**Endpoint:** `GET /api/sets/:setId/stats`

**Respuesta (200 OK):**

```json
{
  "success": true,
  "data": {
    "set_id": "base1",
    "total_cards": 102,
    "avg_price_usd": 12.5,
    "max_price_usd": 450.5,
    "cards_with_price": 98,
    "rarity_distribution": {
      "Common": 32,
      "Rare Holo": 16
    }
  }
}
```

---

### Listar Series

**Endpoint:** `GET /api/sets/series`

**Respuesta (200 OK):**

```json
{
  "success": true,
  "data": ["Base", "Gym", "Neo", "Sword & Shield"]
}
```

---

### Sets por Serie

**Endpoint:** `GET /api/sets/series/:seriesName`

**Respuesta (200 OK):**

```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id": "swsh1",
      "name": "Sword & Shield",
      "series": "Sword & Shield",
      "total": 202
    }
  ]
}
```

---

## 💰 Precios

### Actualizar Precio Individual

**Endpoint:** `POST /api/prices/update/:cardId`

**Respuesta (200 OK):**

```json
{
  "message": "Precio actualizado correctamente",
  "cardId": "base1-4",
  "currentPrice": {
    "priceUsd": 495.0,
    "source": "tcgplayer"
  }
}
```

---

### Actualizar Precio Agregado

**Endpoint:** `POST /api/prices/update-aggregated/:cardId`

**Respuesta (200 OK):**

```json
{
  "message": "Precio agregado actualizado",
  "cardId": "base1-4",
  "averagePriceEur": 450.0,
  "averagePriceUsd": 495.0,
  "sourceCount": 2,
  "sources": [
    {
      "source": "tcgplayer",
      "priceUsd": 500.5
    },
    {
      "source": "cardmarket",
      "priceEur": 445.0
    }
  ]
}
```

---

### Estadísticas Sin Precio

**Endpoint:** `GET /api/prices/without-price-stats`

**Respuesta (200 OK):**

```json
{
  "total_cards": 156,
  "first_attempt": 45,
  "few_attempts": 78,
  "avg_attempts": "2.8"
}
```

---

## 🚦 Rate Limiting

| Tipo de Endpoint | Límite       | Ventana    |
| ---------------- | ------------ | ---------- |
| General          | 100 requests | 15 minutos |
| Búsqueda         | 50 requests  | 5 minutos  |
| Sincronización   | 10 requests  | 1 hora     |
| Actualización    | 30 requests  | 5 minutos  |

**Headers:**

```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1675345200
```

**Error (429):**

```json
{
  "success": false,
  "error": "Too many requests",
  "retry_after": 300
}
```

---

## 💾 Cache

| Cache | TTL    | Endpoints              |
| ----- | ------ | ---------------------- |
| Corta | 5 min  | Búsquedas, filtros     |
| Media | 30 min | Detalles, precios      |
| Larga | 1 hora | Sets, estadísticas     |

**Header cacheado:**

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

### Códigos HTTP

| Código | Significado           |
| ------ | --------------------- |
| `200`  | OK                    |
| `202`  | Accepted (async)      |
| `400`  | Bad Request           |
| `404`  | Not Found             |
| `429`  | Too Many Requests     |
| `500`  | Internal Server Error |

### Formato de Error

```json
{
  "success": false,
  "error": "Mensaje del error",
  "code": "ERROR_CODE",
  "details": {
    "field": "cardId",
    "message": "Formato inválido"
  }
}
```

### Validaciones

**Card ID:**

```
✅ base1-4
✅ xy1-10
❌ base14 (sin guión)
```

**Precios:**

```
✅ minPrice=0, maxPrice=1000
❌ minPrice=-10 (negativo)
❌ minPrice=100, maxPrice=50
```

**Búsqueda:**

```
✅ q=pikachu (2-100 chars)
❌ q=a (muy corto)
```

---

## 🤖 Tareas Programadas

| Tarea               | Frecuencia      | Descripción               |
| ------------------- | --------------- | ------------------------- |
| Sync Sets           | Diaria 3 AM     | Sincroniza sets           |
| Sync Cards          | Cada 12h        | Actualiza cartas          |
| Hot Prices          | Cada hora       | Top 50 populares          |
| Normal Prices       | Cada 6h         | 100 aleatorias            |
| Retry Without Price | Domingo 4 AM    | Reintentar sin precio     |

---

## 📊 Ejemplos de Uso

### Flujo: Consultar Precio

```bash
# 1. Buscar carta
curl "http://localhost:3000/api/cards/search?q=charizard"

# 2. Detalles completos
curl "http://localhost:3000/api/cards/base1-4"

# 3. Actualizar precio
curl -X POST "http://localhost:3000/api/prices/update-aggregated/base1-4"

# 4. Alerta de precio
curl "http://localhost:3000/api/cards/base1-4/price-alert?targetPrice=400&condition=below"
```

### Flujo: Explorar Colección

```bash
# 1. Series
curl "http://localhost:3000/api/sets/series"

# 2. Sets de serie
curl "http://localhost:3000/api/sets/series/Base"

# 3. Detalles set
curl "http://localhost:3000/api/sets/base1"

# 4. Estadísticas
curl "http://localhost:3000/api/sets/base1/stats"
```

### Filtrado Avanzado

```bash
curl "http://localhost:3000/api/cards/filter?supertype=Pokémon&rarity=Rare%20Holo&minPrice=100&currency=usd&sortBy=last_price_usd&sortOrder=desc"
```

---

## 📝 Notas Adicionales

### Agregación de Precios

- **TCGPlayer** (USD) - Mercado US
- **Cardmarket** (EUR) - Mercado EU
- Promedio ponderado con conversión automática

### Cartas Sin Precio

Marcadas y reintentadas después de 30 días.

### Cache Invalidation

Automática al:

- Actualizar precio
- Sincronizar carta
- Modificar set

---

**Versión:** 1.0.0  
**Última actualización:** 2 Febrero 2026  
**Licencia:** MIT
