import { z } from 'zod';

export const CreateOrderSchema = z.object({
  demandId: z.string().min(1, 'Fee demand ID is required'),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
