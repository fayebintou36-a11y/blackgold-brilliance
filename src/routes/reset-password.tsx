import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { pageHead } from '@/components/couture/site'

export const Route=createFileRoute('/reset-password')({head:()=>pageHead('Définir le mot de passe','Sécurisez votre accès à l’administration Omar Wally Fashion.'),component:ResetPassword})
export function ResetPassword(){
 const [status,setStatus]=useState<'checking'|'ready'|'signed-out'|'error'>('checking')
 const [attempt,setAttempt]=useState(0)
 const [password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[forced,setForced]=useState(false),[current,setCurrent]=useState('')
 const navigate=useNavigate()
 useEffect(()=>{
  let active=true
  setStatus('checking')
  setError('')
  const timeout=setTimeout(()=>{
   if(!active)return
   setStatus('error')
   setError('La connexion met trop de temps à se rétablir. Réessayez ou reconnectez-vous.')
  },10000)
  function restore(session:Session|null){
   if(!active)return
   clearTimeout(timeout)
   setForced(Boolean(session?.user.user_metadata?.['must_change_password']))
   setStatus(session?'ready':'signed-out')
   setError('')
  }
  // Subscribe before checking storage so recovery and late-restored sessions are not missed.
  // Auth callbacks only update React state; never await another auth operation here.
  const {data}=supabase.auth.onAuthStateChange((_event,session)=>restore(session))
  void supabase.auth.getSession().then(({data,error})=>{
   if(!active)return
   if(error){clearTimeout(timeout);setStatus('error');setError('Votre connexion n’a pas pu être rétablie. Réessayez ou reconnectez-vous.');return}
   restore(data.session)
  }).catch(()=>{
   if(!active)return
   clearTimeout(timeout)
   setStatus('error')
   setError('Votre connexion n’a pas pu être rétablie. Réessayez ou reconnectez-vous.')
  })
  return()=>{active=false;clearTimeout(timeout);data.subscription.unsubscribe()}
 },[attempt])
 useEffect(()=>{
  if(status!=='ready')return
  let active=true
  // Refresh account metadata without blocking editable fields on a network read.
  void supabase.auth.getUser().then(({data})=>{
   if(active&&data.user)setForced(Boolean(data.user.user_metadata?.['must_change_password']))
  }).catch(()=>{})
  return()=>{active=false}
 },[status,attempt])
 async function submit(e:React.FormEvent){
  e.preventDefault()
  if(busy||status!=='ready')return
  setError('')
  if(password!==confirm){setError('Les mots de passe ne correspondent pas.');return}
  setBusy(true)
  try{
   const {error}=await supabase.auth.updateUser(forced&&current?{password,current_password:current,data:{must_change_password:false}}:{password,data:{must_change_password:false}})
   if(error){
    const code=(error as {code?:string}).code??'',msg=error.message.toLowerCase()
    if(code==='current_password_required'){setForced(true);setError('Saisissez votre mot de passe actuel pour confirmer le changement.');return}
    setError(code==='same_password'||msg.includes('same')?'Choisissez un mot de passe différent de l’actuel.':code==='weak_password'||msg.includes('weak')||msg.includes('pwned')?'Ce mot de passe est trop faible ou déjà connu. Choisissez-en un autre.':code==='invalid_credentials'||msg.includes('current')||msg.includes('invalid')?'Le mot de passe actuel est incorrect.':'Le mot de passe n’a pas pu être modifié. Réessayez.')
    return
   }
   await navigate({to:'/admin'})
  }catch{setError('Le mot de passe n’a pas pu être modifié. Vérifiez votre connexion et réessayez.')}
  finally{setBusy(false)}
 }
 return <div className="auth-page"><form className="auth-card" onSubmit={submit}><h1>Votre mot de passe</h1>
  {status==='checking'&&<p role="status">Rétablissement de votre connexion…</p>}
  {status==='ready'&&<><p>Pour sécuriser votre accès, choisissez un nouveau mot de passe personnel (12 caractères minimum).</p>
   {forced&&<label>Mot de passe actuel<input type="password" autoComplete="current-password" required value={current} onChange={e=>setCurrent(e.target.value)}/></label>}
   <label>Nouveau mot de passe<input type="password" autoComplete="new-password" minLength={12} required value={password} onChange={e=>setPassword(e.target.value)}/></label>
   <label>Confirmer le mot de passe<input type="password" autoComplete="new-password" minLength={12} required value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>
   <Button variant="couture" type="submit" disabled={busy}>{busy?'ENREGISTREMENT…':'ENREGISTRER'}</Button>
  </>}
  {status==='signed-out'&&<><p>Votre session n’est plus active. Reconnectez-vous ou ouvrez le lien reçu par e-mail.</p><Link to="/auth" className="auth-back">Connexion administrateur</Link></>}
  {status==='error'&&<><Button variant="coutureOutline" type="button" onClick={()=>setAttempt(value=>value+1)}>RÉESSAYER</Button><Link to="/auth" className="auth-back">Connexion administrateur</Link></>}
  {error&&<p role="alert">{error}</p>}
 </form></div>
}