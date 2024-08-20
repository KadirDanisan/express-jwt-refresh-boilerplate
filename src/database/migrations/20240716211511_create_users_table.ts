
import { sql } from 'drizzle-orm';
import { db } from '../connection';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const Users = sqliteTable('users', {
    id: integer('id').primaryKey(),
    username: text('username').notNull().unique(),
    firstName: text('firstName').notNull(),
    lastName: text('lastName').notNull(),
    role: text('role').notNull(),
    hashedPassword: text('hashedPassword').notNull(),
    createdAt: text('createdAt').notNull().default('CURRENT_TIMESTAMP'),
    updatedAt: text('updatedAt').notNull().default('CURRENT_TIMESTAMP'),
});


export async function up(): Promise<void> {
    // Tablo oluşturma işlemi için SQL sorgusu
    await db.run(sql`
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            firstName TEXT NOT NULL,
            lastName TEXT NOT NULL,
            role TEXT NOT NULL,
        
            hashedPassword TEXT NOT NULL,
            createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

export async function down(): Promise<void> {
    // Tabloyu kaldırma işlemi için SQL sorgusu
    await db.run(sql`
        DROP TABLE IF EXISTS users;
    `);
}
