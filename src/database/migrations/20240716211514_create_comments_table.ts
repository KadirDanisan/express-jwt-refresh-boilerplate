import { sql } from 'drizzle-orm';
import { db } from '../connection';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// comments tablosu tanımlaması
export const Comments = sqliteTable('comments', {
    id: integer('id').primaryKey(),
    userId: integer('userId').notNull(),
    postId: integer('postId').notNull(),
    title: text('title').notNull(),
    comment: text('comment').notNull(),
    createdAt: text('createdAt').notNull().default('CURRENT_TIMESTAMP'),
    updatedAt: text('updatedAt').notNull().default('CURRENT_TIMESTAMP'),
});

export async function up(): Promise<void> {
    // Tablo oluşturma işlemi için SQL sorgusu
    await db.run(sql`
        CREATE TABLE comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
            postId INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE ON UPDATE CASCADE,
            title TEXT NOT NULL,
            comment TEXT NOT NULL,
            createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

export async function down(): Promise<void> {
    // Tabloyu kaldırma işlemi için SQL sorgusu
    await db.run(sql`
        DROP TABLE IF EXISTS comments;
    `);
}
