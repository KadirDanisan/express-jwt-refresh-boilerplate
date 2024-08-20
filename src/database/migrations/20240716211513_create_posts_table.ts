
import { sql } from 'drizzle-orm';
import { db } from '../connection';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const Posts = sqliteTable('posts', {
    id: integer('id').primaryKey(),
    userId: integer('userId').notNull(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    createdAt: text('createdAt').notNull().default('CURRENT_TIMESTAMP'),
    updatedAt: text('updatedAt').notNull().default('CURRENT_TIMESTAMP'),
});

// Tablo oluşturma işlemi
export async function up(): Promise<void> {
    await db.run(sql`
        CREATE TABLE posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
        );
    `);
}

// Tabloyu kaldırma işlemi
export async function down(): Promise<void> {
    await db.run(sql`
        DROP TABLE IF EXISTS posts;
    `);
}
