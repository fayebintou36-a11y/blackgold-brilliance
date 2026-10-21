import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { LogOut } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { getMyRoles } from '@/lib/admin.functions'
import logo from '@/assets/omar-wally-logo.jpeg.asset.json'
import { Button } from '@/components/ui/button'
import { useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'

const adminNav = [
  { to: '/admin', label: 'Tableau de bord' },
  { to: '/admin/collections', label: 'Collections' },
  { to: '/admin/pieces', label: 'Pièces' },
  { to: '/admin/contenus', label: 'Contenus' },
] as const

export function AdminShell({ children, title }: { children: React.ReactNode; title: string }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const rolesFn = useServerFn(getMyRoles)
  const [state, setState] = useState<'loading' | 'admin' | 'denied'>('loading')

  useEffect(() => {
    let active = true
    rolesFn()
      .then((roles) => { if (active) setState(roles.includes('admin') ? 'admin' : 'denied') })
      .catch(() => { if (active) setState('denied') })
    return () => { active = false }
  }, [])

  async function signOut() {
    await queryClient.cancelQueries()
    queryClient.clear()
    await supabase.auth.signOut()
    await navigate({ to: '/auth', replace:true })
  }

  if (state === 'loading') {
    return <div className="admin-shell"><p className="admin-status">Vérification des accès…</p></div>
  }
  if (state === 'denied') {
    return (
      <div className="admin-shell">
        <div className="admin-denied">
          <h1>Accès réservé</h1>
          <p>Ce compte ne dispose pas des droits d’administration.</p>
          <Button variant="coutureOutline" onClick={signOut}>SE DÉCONNECTER</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <Link to="/" aria-label="Retour au site"><img src={logo.url} alt="Omar Wally Fashion" width={48} height={48} /></Link>
        <nav aria-label="Navigation administration">
          {adminNav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: true }} activeProps={{ className: 'active' }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <Button variant="ghost" className="admin-signout" onClick={signOut}><LogOut size={15} /> Déconnexion</Button>
      </header>
      <main className="admin-main">
        <h1>{title}</h1>
        {children}
      </main>
    </div>
  )
}

export function AdminField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="admin-field"><span>{label}</span>{children}</label>
}
