import * as z from 'zod';

const id = z.preprocess((id) => typeof id === 'string'? +id: id, z.number().int().positive());

export { id as idValidation };
