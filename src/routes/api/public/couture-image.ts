import { createFileRoute } from '@tanstack/react-router'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/integrations/supabase/types'

export const Route=createFileRoute('/api/public/couture-image')({server:{handlers:{GET:async ({request})=>{
 const file=new URL(request.url).searchParams.get('file')
 if(!file||! /^[a-f0-9-]{36}\.(jpeg|png|webp)$/.test(file))return new Response('Not found',{status:404})
 const key=process.env['SUPABASE_PUBLISHABLE_KEY'],url=process.env['SUPABASE_URL']
 if(!key||!url)return new Response('Unavailable',{status:503})
 const client=createClient<Database>(url,key,{auth:{persistSession:false},global:{fetch:(input,init)=>{const h=new Headers(init?.headers);if(key.startsWith('sb_'))h.delete('Authorization');h.set('apikey',key);return fetch(input,{...init,headers:h})}}})
 const imageUrl=`/api/public/couture-image?file=${file}`
 const [collections,pieces]=await Promise.all([client.from('collections').select('id').eq('image_url',imageUrl).limit(1),client.from('pieces').select('id').eq('image_url',imageUrl).limit(1)])
 if(!collections.data?.length&&!pieces.data?.length)return new Response('Not found',{status:404})
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server')
 const {data,error}=await supabaseAdmin.storage.from('couture-images').createSignedUrl(file,300)
 if(error||!data)return new Response('Unavailable',{status:503})
 return new Response(null,{status:302,headers:{Location:data.signedUrl,'Cache-Control':'no-store'}})
}}}})