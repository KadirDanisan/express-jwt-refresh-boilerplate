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
export const refreshTokens = sqliteTable('refresh_tokens', {
    id: integer('id').primaryKey(),
    userId: integer('userId').notNull(),
    revokedAt: text('revokedAt'),
    expiresAt: text('expiresAt').notNull(),
    createdAt: text('createdAt').notNull().default('CURRENT_TIMESTAMP'),
    updatedAt: text('updatedAt').notNull().default('CURRENT_TIMESTAMP'),
});

export const Posts = sqliteTable('posts', {
    id: integer('id').primaryKey(),
    userId: integer('userId').notNull(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    createdAt: text('createdAt').notNull().default('CURRENT_TIMESTAMP'),
    updatedAt: text('updatedAt').notNull().default('CURRENT_TIMESTAMP'),
});
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


