import type { Knex } from 'knex';


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('comments', function(table) {
        table.increments();
        table.integer('userId').notNullable().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
        table.integer('postId').notNullable().references('id').inTable('posts').onDelete('CASCADE').onUpdate('CASCADE');
        table.string('title').notNullable();
        table.text('comment').notNullable();
        table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
        table.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('comments');
}