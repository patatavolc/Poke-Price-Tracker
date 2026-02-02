/**
 * Configuracion de horarios para tareas programadas
 * Formato cron: "segundo minuto hora dia mes dia-semana"
 */

export const SCHEDULES = {
  // Sincronizacion de sets - cada dia a las 3 AM
  SYNC_SETS: {
    cron: "0 3 * * *",
    enabled: true,
    description: "Sincronizar sets desde Pokemon TCG API",
  },

  // Sincronizacion de cartas - cada 12 horas
  SYNC_CARDS: {
    cron: "0 */12 * * *",
    enabled: true,
    description: "Sincronizar todas las cartas",
  },

  // Actualizacion de cartas populares - cada hora
  UPDATE_HOT_PRICES: {
    cron: "0 * * * *",
    enabled: true,
    description: "Actualizar precios de cartas populares",
    batchSize: 50,
  },

  // Actualizacion de cartas normales - cada 6 horas
  UPDATE_NORMAL_PRICES: {
    cron: "0 */6 * * *",
    enabled: true,
    description: "Actualizar precios de cartas normales",
    batchSize: 100,
  },

  // Reintentar cartas sin precio - cada 8 dias a las 4AM
  RETRY_WITHOUT_PRICE: {
    cron: "0 4 * * 0",
    enabled: true,
    description: "Reintentar cartas sin precio disponible",
    olderThanDays: 30,
  },
};


