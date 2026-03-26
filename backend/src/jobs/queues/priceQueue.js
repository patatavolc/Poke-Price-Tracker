import { Queue } from "bullmq";
import redis from "../../config/redis.js";

export const priceQueue = new Queue("pryce-sync", {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
        removeOnComplete: 1000,
        removeOnFail: 500,
    },
});
