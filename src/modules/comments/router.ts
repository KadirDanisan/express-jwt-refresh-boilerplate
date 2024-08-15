import { Router } from 'express';
import { authenticate, validateRequest } from '../../middlewares';
import { CommentsController } from './controller';
import { commentsShowRequestSchema, commentsDestroyRequestSchema, commentsIndexRequestSchema, commentsCreationRequestSchema, commentsUpdateRequestSchema } from './request-schemas';

const app = Router();


app.get('/', validateRequest(commentsIndexRequestSchema), CommentsController.index);
app.post('/', [validateRequest(commentsCreationRequestSchema), authenticate], CommentsController.store);
app.get('/:id', validateRequest(commentsShowRequestSchema), CommentsController.show);
app.put('/:id', [validateRequest(commentsUpdateRequestSchema), authenticate], CommentsController.update);
app.delete('/:id', [validateRequest(commentsDestroyRequestSchema), authenticate], CommentsController.destroy);

export {
    app as CommentsRouter,
};