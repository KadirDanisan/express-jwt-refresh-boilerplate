import { NextFunction, Request, Response } from 'express';
import { CommentsService } from './service';
import { ForbiddenException, NotFoundException } from '../../utils';
import { User, UsersService } from '../users';
import { Comment } from './types';
import { CommentsCreatePayload, CommentsUpdatePayload } from './request-schemas';

export class CommentsController {
    static async index(req: Request, res: Response, next: NextFunction) {
        const postId = req.query.postId ? +req.query.postId : undefined;

        try {
            const comments = await CommentsService.getAll(postId);
            res.json(comments);
        } catch (error) {
            next(error);
        }
    }

    static async show(req: Request, res: Response, next: NextFunction) {
        const id = +req.params.id;

        try {
            const comment = await CommentsService.getById(id);
            if (!comment) {
                throw new NotFoundException('Comment not found');
            }
            res.json(comment);
        } catch (error) {
            next(error);
        }
    }

    static async store(req: Request, res: Response, next: NextFunction) {
        const payload = req.body as CommentsCreatePayload;
        const userId = req.user.id;

        try {
            const comment = await CommentsService.create({ ...payload, userId });
            res.json(comment);
        } catch (error) {
            next(error);
        }
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        const commentId = +req.params.id;
        const userId = req.user.id;
        const payload = req.body as CommentsUpdatePayload;

        try {
            await checkIfAllowedToModify(userId, commentId);
            const updatedComment = await CommentsService.update(commentId, payload);
            if (!updatedComment) {
                throw new NotFoundException('Comment not found');
            }
            res.json(updatedComment);
        } catch (error) {
            next(error);
        }
    }

    static async destroy(req: Request, res: Response, next: NextFunction) {
        const commentId = +req.params.id;
        const userId = req.user.id;

        try {
            await checkIfAllowedToModify(userId, commentId);
            const isDeleted = await CommentsService.delete(commentId);

            if (!isDeleted) {
                throw new NotFoundException('Comment not found');
            }

            res.json({ message: 'Comment deleted' });
        } catch (error) {
            next(error);
        }
    }
}

async function checkIfAllowedToModify(userId: number, commentId: number) {
    const [user, comment] = (await Promise.all([
        UsersService.show(userId),
        CommentsService.getById(commentId)
    ])) as [User, Comment];

    const allowed = user.role === 'admin' || user.id === comment.userId;

    if (!allowed) {
        throw new ForbiddenException();
    }
}
