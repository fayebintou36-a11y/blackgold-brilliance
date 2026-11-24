import { createFileRoute } from '@tanstack/react-router'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/integrations/supabase/types'

// Checks the photo is published (public read of collections/pieces), then signs it server-side.
// Direct storage reads are admin-only, so unpublished files are never reachable.
export const Route=createFileRoute('/api/public/couture-image')({server:{handlers:{GET:async ({request})=>{
 const file=new URL(request.url).searchParams.get('file')
 if(!file||! /^[a-f0-9-]{36}\.(jpeg|png|webp)$/.test(file))return new Response('Not found',{status:404})
 const key=process.env['SUPABASE_PUBLISHABLE_KEY']||import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'],url=process.env['SUPABASE_URL']||import.meta.env['VITE_SUPABASE_URL']
 if(!key||!url)return new Response('Unavailable',{status:503})
 const client=createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{const h=new Headers(init?.headers);if(key.startsWith('sb_')&&h.get('Authorization')===`Bearer ${key}`)h.delete('Authorization');h.set('apikey',key);return fetch(input,{...init,headers:h})}}})
 const ref=`/api/public/couture-image?file=${file}`
 const [p,c]=await Promise.all([client.from('pieces').select('id').eq('image_url',ref).limit(1),client.from('collections').select('id').eq('image_url',ref).limit(1)])
 if(!p.data?.length&&!c.data?.length)return new Response('Not found',{status:404})
 try{
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server')
  const {data,error}=await supabaseAdmin.storage.from('couture-images').createSignedUrl(file,300)
  if(error||!data)return new Response('Not found',{status:404})
  return new Response(null,{status:302,headers:{Location:data.signedUrl,'Cache-Control':'no-store'}})
 }catch{return new Response('Unavailable',{status:503})}
}}}})
