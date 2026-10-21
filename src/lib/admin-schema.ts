import { z } from 'zod'

export const imageUrlSchema = z.string().max(1000).refine(value => {
  if (value === '') return true
  if (value.startsWith('/__l5e/assets-v1/')) return !value.includes('..')
  if (/^\/api\/public\/couture-image\?file=[a-f0-9-]{36}\.(jpeg|png|webp)$/.test(value)) return true
  try { return new URL(value).protocol === 'https:' } catch { return false }
}, 'Utilisez une adresse HTTPS ou une photo téléchargée.')

export const collectionInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(120),
  category: z.string().trim().max(120).default(''),
  description: z.string().trim().max(2000).default(''),
  image_url: imageUrlSchema.default(''),
  sort_order: z.number().int().min(0).max(9999).default(0),
})
export const pieceInput = collectionInput.extend({ collection_id: z.string().uuid().nullable().default(null) })
export const publicPages = ['accueil','a-propos','creations','services','galerie','contact','rendez-vous','confidentialite','mentions-legales'] as const
export const contentSections = ['titre','introduction','texte','texte-secondaire','titre-section','accroche'] as const
export const pageContentInput = z.object({
  page: z.enum(publicPages), section: z.enum(contentSections), content: z.string().trim().max(20000).default(''),
})
export function assertAdminRoles(roles: string[]) {
  if (!roles.includes('admin')) throw new Error('Accès réservé aux administrateurs')
}