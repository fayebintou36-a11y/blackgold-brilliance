import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { pageHead } from '@/components/couture/site'
import logo from '@/assets/omar-wally-logo.jpeg.asset.json'

export const Route = createFileRoute('/auth')({
  head: () => pageHead('Connexion administrateur', 'Espace réservé à l’équipe Omar Wally Fashion.'),
  component: AuthPage,
})

function AuthPage() {
  const navigate = useNavigate()
  const [notice,setNotice]=useState('')
  useEffect(()=>{
    const type=new URLSearchParams(window.location.hash.slice(1)).get('type')
    if(type==='invite'||type==='recovery'){void navigate({to:'/reset-password'});return}
    void supabase.auth.getUser().then(({data})=>{if(data.user)void navigate({to:'/admin'})})
  },[navigate])
  async function resetPassword(){
    setLoading(true)
    const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/reset-password`})
    setLoading(false)
    setNotice(error?'Le lien ne peut pas être envoyé pour le moment. Réessayez plus tard.':'Si ce compte existe, un lien a été envoyé par e-mail.')
  }
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (signInError) {
      setError('E-mail ou mot de passe incorrect.')
      return
    }
    navigate({ to: '/admin' })
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <img src={logo.url} alt="Omar Wally Fashion" width={64} height={64} />
        <h1>Espace administrateur</h1>
        <p>Connexion réservée à l’équipe de la maison.</p>
        <label>
          E-mail
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Mot de passe
          <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <Button variant="couture" type="submit" disabled={loading}>
          {loading ? 'CONNEXION…' : 'SE CONNECTER'}
        </Button>
        <Button variant="ghost" type="button" disabled={!email||loading} onClick={resetPassword}>Mot de passe oublié ?</Button>
        {notice&&<p role="status">{notice}</p>}
        <Link to="/" className="auth-back">← Retour au site</Link>
      </form>
    </div>
  )
}
