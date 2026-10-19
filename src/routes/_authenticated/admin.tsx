import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { AdminShell } from '@/components/couture/admin'
import { listCollections, listPieces, listPageContents } from '@/lib/admin.functions'

export const Route = createFileRoute('/_authenticated/admin')({
  head: () => ({ meta: [{ title: 'Administration — Omar Wally Fashion' }, { name: 'robots', content: 'noindex' }] }),
  component: AdminDashboard,
})

function AdminDashboard() {
  const [counts, setCounts] = useState<{ collections: number; pieces: number; contenus: number } | null>(null)

  useEffect(() => {
    Promise.all([listCollections(), listPieces(), listPageContents()])
      .then(([c, p, pc]) => setCounts({ collections: c.length, pieces: p.length, contenus: pc.length }))
      .catch(() => setCounts({ collections: 0, pieces: 0, contenus: 0 }))
  }, [])

  const cards = [
    { to: '/admin/collections', label: 'Collections', count: counts?.collections, copy: 'Gérez les collections présentées sur le site.' },
    { to: '/admin/pieces', label: 'Pièces', count: counts?.pieces, copy: 'Ajoutez et modifiez les pièces de chaque collection.' },
    { to: '/admin/contenus', label: 'Contenus', count: counts?.contenus, copy: 'Modifiez les textes des pages publiques.' },
  ] as const

  return (
    <AdminShell title="Tableau de bord">
      <div className="admin-cards">
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
