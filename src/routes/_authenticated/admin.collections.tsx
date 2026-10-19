import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { AdminShell, AdminField } from '@/components/couture/admin'
import { Button } from '@/components/ui/button'
import { listCollections, saveCollection, deleteCollection } from '@/lib/admin.functions'

type Collection = {
  id: string
  name: string
  category: string
  description: string
  image_url: string
  sort_order: number
}

const empty = { name: '', category: '', description: '', image_url: '', sort_order: 0 }

export const Route = createFileRoute('/_authenticated/admin/collections')({
  head: () => ({ meta: [{ title: 'Collections — Administration' }, { name: 'robots', content: 'noindex' }] }),
  component: AdminCollections,
})

function AdminCollections() {
  const [rows, setRows] = useState<Collection[]>([])
  const [form, setForm] = useState<typeof empty & { id?: string }>(empty)
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function refresh() {
    listCollections().then(setRows).catch((e) => setStatus(e.message))
  }
  useEffect(refresh, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setStatus(null)
    try {
      await saveCollection({ data: form })
      setForm(empty)
      setStatus('Collection enregistrée.')
      refresh()
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Erreur lors de l’enregistrement.')
    } finally {
      setBusy(false)
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm('Supprimer définitivement cette collection ?')) return
    try {
      await deleteCollection({ data: { id } })
      refresh()
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
    }
  }

  return (
    <AdminShell title="Collections">
      <form className="admin-form" onSubmit={onSubmit}>
        <h2>{form.id ? 'Modifier la collection' : 'Nouvelle collection'}</h2>
        <AdminField label="Nom"><input required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></AdminField>
        <AdminField label="Catégorie"><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></AdminField>
        <AdminField label="Description"><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></AdminField>
        <AdminField label="URL de l’image"><input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://…" /></AdminField>
        <AdminField label="Ordre d’affichage"><input type="number" min={0} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></AdminField>
        <div className="admin-form-actions">
          <Button variant="couture" type="submit" disabled={busy}>{form.id ? 'ENREGISTRER' : <><Plus size={14} /> AJOUTER</>}</Button>
          {form.id && <Button variant="coutureOutline" type="button" onClick={() => setForm(empty)}>ANNULER</Button>}
        </div>
        {status && <p className="admin-status" role="status">{status}</p>}
      </form>

      <table className="admin-table">
        <thead><tr><th>Nom</th><th>Catégorie</th><th>Ordre</th><th aria-label="Actions" /></tr></thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.category}</td>
              <td>{c.sort_order}</td>
              <td className="admin-row-actions">
                <button aria-label={`Modifier ${c.name}`} onClick={() => setForm({ id: c.id, name: c.name, category: c.category, description: c.description, image_url: c.image_url, sort_order: c.sort_order })}><Pencil size={15} /></button>
                <button aria-label={`Supprimer ${c.name}`} onClick={() => onDelete(c.id)}><Trash2 size={15} /></button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={4}>Aucune collection pour le moment.</td></tr>}
        </tbody>
      </table>
    </AdminShell>
  )
}
