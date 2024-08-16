import * as z from 'zod';
import { commentValidation, titleValidation  } from './feild-validations';
import { idValidation } from '../../utils';   

export const commentIndexRequestSchema = z.strictObject({
    query: z.strictObject({
            userId: idValidation.optional(),
        },
    ).optional(),
});

export const commentShowRequestSchema = z.strictObject({
    params: z.strictObject({
        id: idValidation,
    }),
});

export const commentCreationRequestSchema = z.strictObject({
    body: z.strictObject({
        title: titleValidation,
        content: commentValidation,
    }),
});

export const commentUpdateRequestSchema = z.strictObject({
    params: z.strictObject({
        id: idValidation,
    }),
    body: z.strictObject({
        title: titleValidation.optional(),
        content: commentValidation.optional(),
    }),
});

export const commentDestroyRequestSchema = z.strictObject({
    params: z.strictObject({
        id: idValidation,
    }),
});


export type CommentsCreatePayload = z.infer<typeof commentCreationRequestSchema>['body'];
export type CommentsUpdatePayload = z.infer<typeof commentUpdateRequestSchema>['body'];