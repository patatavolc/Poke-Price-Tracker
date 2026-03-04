/**
 * Configuración de Jest para tests
 */

export default {
  testEnvironment: "node",
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/*.test.js",
    "!src/config/db.js",
    "!index.js",
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 65,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: ["**/tests/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  verbose: true,
  testTimeout: 10000,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
