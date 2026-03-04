/**
 * Logger especializado para tareas programadas
 * Proporciona logging estructurado con timestamps y contexto
 */

class TaskLogger {
  constructor(taskName) {
    this.taskName = taskName;
    this.startTime = null;
    this.metrics = {
      success: 0,
      failed: 0,
      skipped: 0,
      total: 0,
    };
  }

  start() {
    this.startTime = Date.now();
    console.log(`\n${"=".repeat(80)}`);
    console.log(`[${this.taskName}] INICIANDO`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`${"=".repeat(80)}\n`);
  }

  info(message) {
    console.log(`ℹ️  [${this.taskName}] ${message}`);
  }

  success(message) {
    console.log(`✅ [${this.taskName}] ${message}`);
    this.metrics.success++;
  }

  error(message, error = null) {
    console.error(`❌ [${this.taskName}] ${message}`);
    if (error) {
      console.error(`   Error: ${error.message}`);
    }
    this.metrics.failed++;
  }

  skip(message) {
    console.log(`⏭️  [${this.taskName}] ${message}`);
    this.metrics.skipped++;
  }

  progress(current, total, extra = "") {
    const percentage = ((current / total) * 100).toFixed(1);
    console.log(
      `[${this.taskName}] Progreso: ${current}/${total} (${percentage}%) ${extra}`,
    );
  }

  complete() {
    const duration = Date.now() - this.startTime;
    const durationMin = Math.floor(duration / 60000);
    const durationSec = Math.floor((duration % 60000) / 1000);

    console.log(`\n${"=".repeat(80)}`);
    console.log(`[${this.taskName}] COMPLETADO`);
    console.log(`\nMÉTRICAS:`);
    console.log(`   ✅ Exitosos: ${this.metrics.success}`);
    console.log(`   ❌ Fallidos: ${this.metrics.failed}`);
    console.log(`   ⏭️  Omitidos: ${this.metrics.skipped}`);
    console.log(
      `   Total: ${this.metrics.total || this.metrics.success + this.metrics.failed + this.metrics.skipped}`,
    );
    console.log(`\n  TIEMPO:`);
    console.log(`   Duración: ${durationMin}m ${durationSec}s`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    console.log(`${"=".repeat(80)}\n`);

    return {
      taskName: this.taskName,
      duration,
      metrics: this.metrics,
      timestamp: new Date().toISOString(),
    };
  }
}

export default TaskLogger;
