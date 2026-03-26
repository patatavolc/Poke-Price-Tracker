import { Worker } from "bullmq";
import redis from "../../config/redis.js";
import { syncAggregatedPrice } from "../../services/price/sync.js";

export const startPriceWorker = () => {
    const worker = new Worker(
        "pryce-sync",
        async (job) => {
            const { cardId, cardName } = job.data;
            const result = await syncAggregatedPrice(cardId);
            return { cardId, cardName, succes: !!result };
        },
        {
            connection: redis,
            concurrency: 5,
        },
    );

    worker.on("completed", (job, returnValue) => {
        console.log(`✅ [Job ${job.id}] ${returnValue.cardName} - completado`);
    });

    worker.on("failed", (job, err) => {
        console.error(
            `❌ [Job ${job.id}] ${job.data.cardName} - fallido (intento ${job.attemptsMade}): ${err.message}`,
        );
    });

    worker.on("error", (err) => {
        console.error("❌ Worker error general:", err.message);
    });

    console.log("🔄 Price worker iniciado, escuchando cola 'price-sync'...");
    return worker;
};
