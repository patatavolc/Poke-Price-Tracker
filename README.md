# 🎴 Poke Price Tracker

<div align="center">

![Inicio](docs/images/inicio.png)

Una aplicación completa para el seguimiento de precios de cartas del Pokémon TCG que agrega datos de múltiples fuentes y proporciona históricos de precios detallados.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue.svg)](https://www.postgresql.org/)

</div>

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Capturas de Pantalla](#-capturas-de-pantalla)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Configuración](#%EF%B8%8F-configuración)
- [API Endpoints](#-api-endpoints)
- [Tareas Programadas](#-tareas-programadas)
- [Esquema de Base de Datos](#%EF%B8%8F-esquema-de-base-de-datos)
- [Ramas del Proyecto](#-ramas-del-proyecto)
- [Guía de Desarrollo](#-guía-de-desarrollo)
- [Licencia](#-licencia)

---

## ✨ Características

- 🎯 **Agregación de Precios Multi-Fuente**: Combina precios de TCGPlayer y Cardmarket
- 🔄 **Actualizaciones Automáticas**: Sincronización programada de precios según popularidad
- 📊 **Seguimiento Histórico**: Historial completo de precios para todas las cartas
- 💱 **Conversión de Divisas**: Conversión automática EUR/USD en tiempo real
- ⚡ **Prioridad Inteligente**: Cartas populares se actualizan cada hora, cartas normales cada 6 horas
- 🚀 **Procesamiento por Lotes**: Población eficiente de precios iniciales para grandes datasets
- 🔗 **Sincronización de Sets y Cartas**: Sincronización automática con la API de TCGdex
- 🎨 **Interfaz Moderna**: Frontend desarrollado con Next.js y Tailwind CSS
- 📱 **Diseño Responsive**: Optimizado para dispositivos móviles y desktop

---

## 📸 Capturas de Pantalla

### Página Principal

![Página de Inicio](docs/images/inicio.png)
_Vista principal de la aplicación mostrando el catálogo de cartas_

### Mercado de Cartas

![Card Market](docs/images/card-market.png)
_Listado de cartas disponibles con precios actualizados_

### Detalle de Precios Individuales

![Precio Individual](docs/images/individual-card-price.png)
_Vista detallada del histórico de precios de una carta específica_

### Guía de Estilos

![Guía de Estilos](docs/images/Guia%20de%20estilos.png)
_Sistema de diseño y guía de estilos del proyecto_

---

## 🏗️ Arquitectura del Proyecto

El proyecto está dividido en dos ramas principales:

- **`feature/backend`**: API REST con Node.js y Express
- **`feature/frontend-base`**: Aplicación frontend con Next.js

```
┌─────────────────┐
│   Next.js App   │ ← Frontend (feature/frontend-base)
│   (React 18)    │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  Express API    │ ← Backend (feature/backend)
│   (Node.js)     │
└────────┬────────┘
         │
         ├──► TCGdex API (Sets & Cards)
         ├──► Pokémon TCG API (TCGPlayer Prices)
         ├──► Cardmarket API (EUR Prices)
         ├──► Exchange Rate API (Currency)
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
│   (Supabase)    │
└─────────────────┘
```

---

## 🛠 Stack Tecnológico

### Backend (feature/backend)

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Base de Datos**: PostgreSQL (Supabase)
- **Scheduling**: node-cron
- **HTTP Client**: fetch JavaScript
- **APIs Externas**:
  - [TCGdex API](https://api.tcgdex.net) - Datos de cartas
  - [Pokémon TCG API](https://pokemontcg.io) - Precios TCGPlayer
  - Cardmarket API - Precios europeos
  - [Exchange Rate API](https://open.er-api.com) - Conversión de divisas

### Frontend (feature/frontend-base)

- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18
- **Estilos**: Tailwind CSS
- **Gestión de Estado**: React Context / Hooks
- **HTTP Client**: Fetch API

---

## 📁 Estructura del Proyecto

```
Poke-Price-Tracker/
│
├── backend/                    # API REST (rama: feature/backend)
│   ├── index.js               # Punto de entrada
│   ├── package.json
│   ├── .env                   # Variables de entorno
│   └── src/
│       ├── app.js            # Configuración Express
│       ├── config/
│       │   ├── db.js         # Conexión a PostgreSQL
│       │   └── schema.sql    # Schema de la BD
│       ├── controllers/      # Controladores de rutas
│       │   ├── card.controller.js
│       │   ├── price.controller.js
│       │   └── sync.controller.js
│       ├── jobs/
│       │   └── scheduler.cron.js  # Tareas programadas
│       ├── routes/           # Definición de rutas
│       │   ├── card.routes.js
│       │   ├── price.routes.js
│       │   ├── sync.routes.js
│       │   └── mainRouter.js
│       ├── services/         # Lógica de negocio
│       │   ├── card.service.js
│       │   ├── currency.service.js
│       │   ├── pokemon.service.js
│       │   ├── price.service.js
│       │   └── priceAggregator.service.js
│       └── utils/
│
├── frontend/                  # Aplicación Next.js (rama: feature/frontend-base)
│   ├── components/           # Componentes React
│   ├── app/                  # App Router de Next.js
│   ├── public/               # Recursos estáticos
│   ├── styles/               # Estilos globales
│   └── package.json
│
├── docs/                     # Documentación y recursos
│   └── images/              # Capturas de pantalla
│       ├── inicio.png
│       ├── card-market.png
│       ├── individual-card-price.png
│       └── Guia de estilos.png
│
├── LICENSE                   # Licencia MIT
└── README.md                # Este archivo
```

---

## 📡 API Endpoints

### Sincronización

| Método | Endpoint                 | Descripción                                         |
| ------ | ------------------------ | --------------------------------------------------- |
| `GET`  | `/api/sync/sets`         | Sincroniza todos los sets de cartas                 |
| `GET`  | `/api/sync/cards/:setId` | Sincroniza cartas de un set específico              |
| `GET`  | `/api/sync/all-cards`    | Sincroniza todas las cartas (proceso en background) |

### Cartas

| Método | Endpoint                | Descripción                                            |
| ------ | ----------------------- | ------------------------------------------------------ |
| `GET`  | `/api/card/:id`         | Obtiene detalles de una carta con historial de precios |
| `GET`  | `/api/cards`            | Lista todas las cartas                                 |
| `GET`  | `/api/cards/set/:setId` | Obtiene cartas de un set específico                    |

### Precios

| Método | Endpoint                                | Descripción                    |
| ------ | --------------------------------------- | ------------------------------ |
| `POST` | `/api/prices/update/:cardId`            | Actualiza precio de una fuente |
| `POST` | `/api/prices/update-aggregated/:cardId` | Actualiza precio agregado      |
| `GET`  | `/api/prices/history/:cardId`           | Obtiene historial de precios   |

### Administración

| Método | Endpoint                           | Descripción                              |
| ------ | ---------------------------------- | ---------------------------------------- |
| `POST` | `/api/admin/fill-prices?batch=100` | Llena precios iniciales (batch opcional) |

---

## ⏰ Tareas Programadas

El sistema ejecuta automáticamente las siguientes tareas mediante `node-cron`:

| Tarea                        | Programación         | Descripción                                            |
| ---------------------------- | -------------------- | ------------------------------------------------------ |
| **Sincronización de Sets**   | Diaria a las 3:00 AM | Sincroniza todos los sets desde TCGdex                 |
| **Sincronización de Cartas** | Cada 12 horas        | Actualiza datos de todas las cartas                    |
| **Cartas Populares**         | Cada hora            | Actualiza precios de cartas frecuentemente consultadas |
| **Cartas Normales**          | Cada 6 horas         | Actualiza precios de cartas menos populares            |

Configuración en: `backend/src/jobs/scheduler.cron.js`

---

## 🌿 Ramas del Proyecto

El proyecto utiliza un flujo de trabajo basado en ramas:

### Rama Principal

- **`main`**: Rama principal estable del proyecto

### Ramas de Features

- **`feature/backend`**: Desarrollo del API REST y servicios backend
  - Incluye: Express API, servicios, controladores, cron jobs
- **`feature/frontend-base`**: Desarrollo de la interfaz de usuario
  - Incluye: Next.js app, componentes React, estilos

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 📧 Contacto

Para preguntas o soporte, por favor abre un issue en el repositorio.

---

## 🙏 Agradecimientos

- [TCGdex](https://www.tcgdex.net/) - Por proporcionar datos completos de cartas
- [Pokémon TCG API](https://pokemontcg.io/) - Por los precios de TCGPlayer
- [Supabase](https://supabase.com/) - Por el hosting de PostgreSQL
- Comunidad de Pokémon TCG

---

<div align="center">

**Hecho con ❤️ para la comunidad Pokémon TCG**

⭐ Si este proyecto te resulta útil, considera darle una estrella!

</div>
