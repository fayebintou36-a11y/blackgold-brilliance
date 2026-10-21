import { useServerFn } from '@tanstack/react-start'
import { pageHead } from '@/components/couture/site'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { AdminShell } from '@/components/couture/admin'
import { listCollections, listPieces, listPageContents } from '@/lib/admin.functions'

export const Route = createFileRoute('/_authenticated/admin')({
  head: () => ({meta:[...pageHead('Administration — Administration','Gestion sécurisée de la maison Omar Wally Fashion.').meta,{name:'robots',content:'noindex'}]}),
  component: AdminDashboard,
})

function AdminDashboard() {
 const listCollectionsFn=useServerFn(listCollections),listPiecesFn=useServerFn(listPieces),listPageContentsFn=useServerFn(listPageContents)
  const [error,setError]=useState('')
  const [counts, setCounts] = useState<{ collections: number; pieces: number; contenus: number } | null>(null)

  useEffect(() => {
    Promise.all([listCollectionsFn(), listPiecesFn(), listPageContentsFn()])
      .then(([c, p, pc]) => setCounts({ collections: c.length, pieces: p.length, contenus: pc.length }))
      .catch(() => setError('Impossible de charger les compteurs.'))
  }, [])

  const cards = [
    { to: '/admin/collections', label: 'Collections', count: counts?.collections, copy: 'Gérez les collections présentées sur le site.' },
    { to: '/admin/pieces', label: 'Pièces', count: counts?.pieces, copy: 'Ajoutez et modifiez les pièces de chaque collection.' },
    { to: '/admin/contenus', label: 'Contenus', count: counts?.contenus, copy: 'Modifiez les textes des pages publiques.' },
  ] as const

  return (
    <AdminShell title="Tableau de bord">
      {error&&<p role="alert">{error}</p>}<div className="admin-cards">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="admin-card">
            <strong>{c.count ?? '…'}</strong>
            <h2>{c.label}</h2>
            <p>{c.copy}</p>
            <span className="text-link">GÉRER <ArrowUpRight size={14} /></span>
          </Link>
        ))}
      </div>
    </AdminShell>
  )
}
