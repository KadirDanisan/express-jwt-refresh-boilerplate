import { db } from '../../database'; // knex konfigürasyonunuzu içeren dosya

export class CommentsService {
    static async getAll(postId?: number) {
        let query = db('comments').select('*');

        if (postId) {
            query = query.where({ postId });
        }

        return query;
    }

    static async getById(id: number) {
        return db('comments').where({ id }).first();
    }

    static async create(data: any) {
        const [comment] = await db('comments').insert(data).returning('*');
        return comment;
    }

    static async update(id: number, data: any) {
        const [updatedComment] = await db('comments').where({ id }).update(data).returning('*');
        return updatedComment;
    }

    static async delete(id: number) {
        const deletedCount = await db('comments').where({ id }).del();
        return deletedCount > 0;
    }
}
