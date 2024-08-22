import cron from 'node-cron';
import { refreshTokens } from '../database';
import { db } from '../database';
// This cron job will run every hour and delete all refresh tokens that have expired and were updated more than 6 hours ago
cron.schedule('0 * * * *', async () => {
    await db.delete(refreshTokens).where('expiresAt', new Date())
        .andWhere('updatedAt', '<', new Date(Date.now() - 6 * 60 * 60 * 1000));
});
