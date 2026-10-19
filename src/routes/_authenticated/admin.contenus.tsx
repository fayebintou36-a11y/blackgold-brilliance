import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { AdminShell, AdminField } from '@/components/couture/admin'
import { Button } from '@/components/ui/button'
import { listPageContents, savePageContent, deletePageContent } from '@/lib/admin.functions'

type PageContent = {
  id: string
  page: string
  section: string
  content: string
  updated_at: string
}

const empty = { page: '', section: '', content: '' }

export const Route = createFileRoute('/_authenticated/admin/contenus')({
  head: () => ({ meta: [{ title: 'Contenus — Administration' }, { name: 'robots', content: 'noindex' }] }),
  component: AdminContenus,
})

function AdminContenus() {
  const [rows, setRows] = useState<PageContent[]>([])
  const [form, setForm] = useState<typeof empty>(empty)
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function refresh() {
    listPageContents().then(setRows).catch((e) => setStatus(e.message))
  }
  useEffect(refresh, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setStatus(null)
    try {
      await savePageContent({ data: form })
      setStatus('Contenu enregistré.')
      refresh()
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Erreur lors de l’enregistrement.')
    } finally {
      setBusy(false)
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm('Supprimer définitivement ce contenu ?')) return
    try {
      await deletePageContent({ data: { id } })
      refresh()
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
    }
  }

  return (
    <AdminShell title="Contenus des pages">
      <form className="admin-form" onSubmit={onSubmit}>
        <h2>Modifier un contenu</h2>
        <AdminField label="Page"><input required placeholder="accueil, a-propos, services…" value={form.page} onChange={(e) => setForm({ ...form, page: e.target.value })} /></AdminField>
        <AdminField label="Section"><input required placeholder="titre, introduction…" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} /></AdminField>
        <AdminField label="Contenu"><textarea rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></AdminField>
        <div className="admin-form-actions">
          <Button variant="couture" type="submit" disabled={busy}><Plus size={14} /> ENREGISTRER</Button>
        </div>
        {status && <p className="admin-status" role="status">{status}</p>}
      </form>

      <table className="admin-table">
        <thead><tr><th>Page</th><th>Section</th><th>Contenu</th><th aria-label="Actions" /></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.page}</td>
              <td>{r.section}</td>
              <td className="admin-excerpt">{r.content.slice(0, 80)}{r.content.length > 80 ? '…' : ''}</td>
              <td className="admin-row-actions">
                <button className="text-link" onClick={() => setForm({ page: r.page, section: r.section, content: r.content })}>MODIFIER</button>
                <button aria-label={`Supprimer ${r.page}/${r.section}`} onClick={() => onDelete(r.id)}><Trash2 size={15} /></button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={4}>Aucun contenu personnalisé pour le moment.</td></tr>}
        </tbody>
      </table>
    </AdminShell>
  )
}
