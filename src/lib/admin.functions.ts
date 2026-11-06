import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'
import { collectionInput, pieceInput, pageContentInput, assertAdminRoles } from './admin-schema'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/integrations/supabase/types'

type AuthedContext = { supabase: SupabaseClient<Database>; userId: string }

async function requireAdmin(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
  assertAdminRoles((data ?? []).map(r => r.role))
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

export const listCollections = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as AuthedContext
    await requireAdmin(supabase, userId)
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
    const { supabase, userId } = context as AuthedContext
    await requireAdmin(supabase, userId)
    const { data, error } = await supabase
      .from('pieces')
      .select('*')
      .order('section', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) throw new Error(error.message)
    return data ?? []
  })

export const movePiece = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), direction: z.enum(['up', 'down']) }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as AuthedContext
    await requireAdmin(supabase, userId)
    const { data: rows, error } = await supabase
      .from('pieces')
      .select('id, section, sort_order')
      .order('section', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) throw new Error(error.message)
    const list = rows ?? []
    const current = list.find((p) => p.id === data.id)
    if (!current) throw new Error('Photo introuvable.')
    const siblings = list.filter((p) => p.section === current.section)
    const index = siblings.findIndex((p) => p.id === data.id)
    const neighbor = data.direction === 'up' ? siblings[index - 1] : siblings[index + 1]
    if (!neighbor) return { ok: true }
    // Renumber the section sequentially so equal sort_order values still swap.
    const reordered = [...siblings]
    reordered[index] = neighbor
    reordered[data.direction === 'up' ? index - 1 : index + 1] = current
    const now = new Date().toISOString()
    for (let i = 0; i < reordered.length; i++) {
      if (reordered[i].sort_order === i) continue
      const { error: updateError } = await supabase.from('pieces').update({ sort_order: i, updated_at: now }).eq('id', reordered[i].id)
      if (updateError) throw new Error(updateError.message)
    }
    return { ok: true }
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
    const { supabase, userId } = context as AuthedContext
    await requireAdmin(supabase, userId)
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
