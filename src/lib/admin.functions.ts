import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'

type AuthedContext = { supabase: any; userId: string }

async function requireAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
  if (!(data ?? []).some((r: { role: string }) => r.role === 'admin')) {
    throw new Error('Accès réservé aux administrateurs')
  }
}

export const getMyRoles = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as AuthedContext
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
    if (error) throw new Error(error.message)
    return (data ?? []).map((r: { role: string }) => r.role)
  })

const collectionInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2).max(120),
  category: z.string().max(120).default(''),
  description: z.string().max(2000).default(''),
  image_url: z.string().max(1000).default(''),
  sort_order: z.number().int().min(0).max(9999).default(0),
})

const pieceInput = collectionInput.extend({
  collection_id: z.string().uuid().nullable().default(null),
})

const pageContentInput = z.object({
  page: z.string().min(1).max(80),
  section: z.string().min(1).max(80),
  content: z.string().max(20000).default(''),
})

export const listCollections = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as AuthedContext
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) throw new Error(error.message)
    return data ?? []
  })

export const saveCollection = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(collectionInput)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as AuthedContext
    await requireAdmin(supabase, userId)
    const { id, ...fields } = data
    const query = id
      ? supabase.from('collections').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id).select().single()
      : supabase.from('collections').insert(fields).select().single()
    const { data: row, error } = await query
    if (error) throw new Error(error.message)
    return row
  })

export const deleteCollection = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as AuthedContext
    await requireAdmin(supabase, userId)
    const { error } = await supabase.from('collections').delete().eq('id', data.id)
    if (error) throw new Error(error.message)
    return { ok: true }
  })

export const listPieces = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as AuthedContext
    const { data, error } = await supabase
      .from('pieces')
      .select('*, collections(name)')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) throw new Error(error.message)
    return data ?? []
  })

export const savePiece = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(pieceInput)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as AuthedContext
    await requireAdmin(supabase, userId)
    const { id, ...fields } = data
    const query = id
      ? supabase.from('pieces').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id).select().single()
      : supabase.from('pieces').insert(fields).select().single()
    const { data: row, error } = await query
    if (error) throw new Error(error.message)
    return row
  })

export const deletePiece = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as AuthedContext
    await requireAdmin(supabase, userId)
    const { error } = await supabase.from('pieces').delete().eq('id', data.id)
    if (error) throw new Error(error.message)
    return { ok: true }
  })

export const listPageContents = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as AuthedContext
    const { data, error } = await supabase
      .from('page_contents')
      .select('*')
      .order('page', { ascending: true })
      .order('section', { ascending: true })
    if (error) throw new Error(error.message)
    return data ?? []
  })

export const savePageContent = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(pageContentInput)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as AuthedContext
    await requireAdmin(supabase, userId)
    const { data: row, error } = await supabase
      .from('page_contents')
      .upsert({ ...data, updated_at: new Date().toISOString() }, { onConflict: 'page,section' })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return row
  })

export const deletePageContent = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as AuthedContext
    await requireAdmin(supabase, userId)
    const { error } = await supabase.from('page_contents').delete().eq('id', data.id)
    if (error) throw new Error(error.message)
    return { ok: true }
  })
