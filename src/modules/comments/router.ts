import { Router } from 'express';
import { authenticate, validateRequest } from '../../middlewares';
import { CommentsController } from './controller';
import { commentShowRequestSchema, commentDestroyRequestSchema, commentIndexRequestSchema, commentCreationRequestSchema, commentUpdateRequestSchema } from './request-schemas';

const app = Router();


app.get('/', validateRequest(commentIndexRequestSchema), CommentsController.index);
app.post('/', [validateRequest(commentCreationRequestSchema), authenticate], CommentsController.store);
app.get('/:id', validateRequest(commentShowRequestSchema), CommentsController.show);
app.put('/:id', [validateRequest(commentUpdateRequestSchema), authenticate], CommentsController.update);
app.delete('/:id', [validateRequest(commentDestroyRequestSchema), authenticate], CommentsController.destroy);

export {
    app as CommentsRouter,
};