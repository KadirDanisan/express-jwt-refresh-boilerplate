import * as z from 'zod';

const title = z.string().min(2).max(32);
const comment = z.string().min(1).max(1024);
const commentId = z.number().max(128);

export {
    title as titleValidation,
    comment as commentValidation,
    commentId as commentIdValidation,
};