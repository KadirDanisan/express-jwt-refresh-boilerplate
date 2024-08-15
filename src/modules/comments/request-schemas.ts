import * as z from 'zod';
import { contentValidation, titleValidation  } from './feild-validations';
import { idValidation } from '../../utils';   

export const commentsIndexRequestSchema = z.strictObject({
    query: z.strictObject({
            userId: idValidation.optional(),
        },
    ).optional(),
});

export const commentsShowRequestSchema = z.strictObject({
    params: z.strictObject({
        id: idValidation,
    }),
});

export const commentsCreationRequestSchema = z.strictObject({
    body: z.strictObject({
        title: titleValidation,
        content: contentValidation,
    }),
});

export const commentsUpdateRequestSchema = z.strictObject({
    params: z.strictObject({
        id: idValidation,
    }),
    body: z.strictObject({
        title: titleValidation.optional(),
        content: contentValidation.optional(),
    }),
});

export const commentsDestroyRequestSchema = z.strictObject({
    params: z.strictObject({
        id: idValidation,
    }),
});


export type CommentsCreatePayload = z.infer<typeof commentsCreationRequestSchema>['body'];
export type CommentsUpdatePayload = z.infer<typeof commentsUpdateRequestSchema>['body'];