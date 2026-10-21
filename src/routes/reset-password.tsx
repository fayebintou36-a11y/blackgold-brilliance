import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { pageHead } from '@/components/couture/site'

export const Route=createFileRoute('/reset-password')({head:()=>pageHead('Définir le mot de passe','Sécurisez votre accès à l’administration Omar Wally Fashion.'),component:ResetPassword})
function ResetPassword(){
 const [ready,setReady]=useState(false),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false)
 const navigate=useNavigate()
 useEffect(()=>{void supabase.auth.getUser().then(({data})=>setReady(Boolean(data.user)))},[])
 async function submit(e:React.FormEvent){e.preventDefault();if(password!==confirm){setError('Les mots de passe ne correspondent pas.');return}setBusy(true);const {error}=await supabase.auth.updateUser({password});setBusy(false);if(error){setError('Le mot de passe n’a pas pu être modifié. Demandez un nouveau lien.');return}await navigate({to:'/admin'})}
 return <div className="auth-page"><form className="auth-card" onSubmit={submit}><h1>Votre mot de passe</h1>{ready?<><label>Nouveau mot de passe<input type="password" autoComplete="new-password" minLength={12} required value={password} onChange={e=>setPassword(e.target.value)}/></label><label>Confirmer le mot de passe<input type="password" autoComplete="new-password" minLength={12} required value={confirm} onChange={e=>setConfirm(e.target.value)}/></label><Button variant="couture" disabled={busy}>ENREGISTRER</Button></>:<p>Ouvrez le lien reçu par e-mail pour définir votre mot de passe.</p>}{error&&<p role="alert">{error}</p>}</form></div>
}