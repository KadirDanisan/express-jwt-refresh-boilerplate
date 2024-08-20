
import { sql } from 'drizzle-orm';
import { db } from '../connection';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const RefreshTokens = sqliteTable('refresh_tokens', {
    id: integer('id').primaryKey(),
    userId: integer('userId').notNull(),
    revokedAt: text('revokedAt'),
    expiresAt: text('expiresAt').notNull(),
    createdAt: text('createdAt').notNull().default('CURRENT_TIMESTAMP'),
    updatedAt: text('updatedAt').notNull().default('CURRENT_TIMESTAMP'),
});

// Tablo oluşturma işlemi
export async function up(): Promise<void> {
    await db.run(sql`
        CREATE TABLE refresh_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            revokedAt TEXT DEFAULT NULL,
            expiresAt TEXT NOT NULL,
            createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
        );
    `);
}

// Tabloyu kaldırma işlemi
export async function down(): Promise<void> {
    await db.run(sql`
        DROP TABLE IF EXISTS refresh_tokens;
    `);
}
