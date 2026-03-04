/**
 * Configuración global para tests
 */

// Mock de variables de entorno para tests
process.env.NODE_ENV = "test";
process.env.PORT = "3001";
process.env.POKEMON_TCG_API_URL = "https://api.pokemontcg.io/v2";
process.env.POKEMON_TCG_API_KEY = "test-api-key";
process.env.TCGDEX_API_URL = "https://api.tcgdex.net/v2/en";

// Suprimir logs durante tests
global.console = {
  ...console,
  log: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
};
