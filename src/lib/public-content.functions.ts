import { createServerFn } from '@tanstack/react-start'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/integrations/supabase/types'

export const getPublicContent = createServerFn({ method: 'GET' }).handler(async () => {
  const url = process.env['SUPABASE_URL']
  const key = process.env['SUPABASE_PUBLISHABLE_KEY']
  if (!url || !key) throw new Error('Le contenu du site est momentanément indisponible.')
  const client = createClient<Database>(url, key, {
    auth: { persistSession:false, autoRefreshToken:false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers)
      if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization')
      headers.set('apikey', key)
      return fetch(input, { ...init, headers })
    } },
  })
  const [collections, pieces, contents] = await Promise.all([
    client.from('collections').select('id,name,category,description,image_url,sort_order').order('sort_order').order('created_at'),
    client.from('pieces').select('id,collection_id,name,category,description,image_url,sort_order').order('sort_order').order('created_at'),
    client.from('page_contents').select('page,section,content'),
  ])
  if (collections.error || pieces.error || contents.error) throw new Error('Le contenu du site est momentanément indisponible.')
  return { collections:collections.data ?? [], pieces:pieces.data ?? [], contents:contents.data ?? [] }
})