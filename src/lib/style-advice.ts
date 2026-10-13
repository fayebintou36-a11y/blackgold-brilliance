import { z } from 'zod'

export const styleAdviceSchema = z.object({
  occasion: z.string().trim().min(3).max(400),
  preferences: z.string().trim().min(3).max(1200),
  budget: z.number().finite().positive(),
  currency: z.enum(['XOF', 'EUR']),
})
export type StyleAdviceInput = z.infer<typeof styleAdviceSchema>