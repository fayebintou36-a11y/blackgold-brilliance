import { useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'

export function AdminImage({value,onChange}:{value:string;onChange:(url:string)=>void}) {
 const [busy,setBusy]=useState(false)
 const [error,setError]=useState('')
 async function upload(file?:File) {
  if(!file)return
  setError('')
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024){setError('Choisissez un JPG, PNG ou WebP de moins de 10 Mo.');return}
  setBusy(true)
  try {
   const path=`${crypto.randomUUID()}.${file.type.split('/')[1]}`
   const result=await supabase.storage.from('couture-images').upload(path,file,{contentType:file.type,upsert:false})
   if(result.error)throw result.error
   onChange(supabase.storage.from('couture-images').getPublicUrl(path).data.publicUrl)
  } catch {setError('La photo n’a pas pu être téléchargée. Réessayez.')} finally{setBusy(false)}
 }
 return <div className="admin-image"><label>Photo<input type="text" value={value} onChange={e=>onChange(e.target.value)} placeholder="https://…"/></label><Button variant="coutureOutline" type="button" asChild><label><Upload size={16}/>{busy?'TÉLÉCHARGEMENT…':'CHOISIR UNE PHOTO'}<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>void upload(e.target.files?.[0])}/></label></Button>{value&&<img src={value} alt="Aperçu de la photo"/>}{error&&<p role="alert">{error}</p>}</div>
}