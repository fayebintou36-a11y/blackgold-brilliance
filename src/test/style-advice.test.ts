import { describe, expect, it } from 'vitest'
import { styleAdviceSchema } from '@/lib/style-advice'

const request = { occasion: 'Mariage à Dakar', preferences: 'Bazin vert, broderies discrètes', budget: 75000, currency: 'XOF' }
describe('Senegalese couture advice inputs', () => {
  it('preserves the occasion and preferences supplied by the visitor', () => {
    const data = styleAdviceSchema.parse(request)
    expect(data.occasion).toBe('Mariage à Dakar')
    expect(data.preferences).toBe('Bazin vert, broderies discrètes')
  })
  it('preserves the exact budget and currency', () => {
    expect(styleAdviceSchema.parse(request)).toMatchObject({ budget: 75000, currency: 'XOF' })
    expect(styleAdviceSchema.safeParse({ ...request, budget: -1 }).success).toBe(false)
  })
})