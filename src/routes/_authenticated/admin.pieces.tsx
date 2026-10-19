import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { AdminShell, AdminField } from '@/components/couture/admin'
import { Button } from '@/components/ui/button'
import { listPieces, savePiece, deletePiece, listCollections } from '@/lib/admin.functions'

type Piece = {
  id: string
  collection_id: string | null
  name: string
  category: string
  description: string
  image_url: string
  sort_order: number
  collections?: { name: string } | null
}

const empty = { collection_id: null as string | null, name: '', category: '', description: '', image_url: '', sort_order: 0 }

export const Route = createFileRoute('/_authenticated/admin/pieces')({
  head: () => ({ meta: [{ title: 'Pièces — Administration' }, { name: 'robots', content: 'noindex' }] }),
  component: AdminPieces,
})

function AdminPieces() {
  const [rows, setRows] = useState<Piece[]>([])
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([])
  const [form, setForm] = useState<typeof empty & { id?: string }>(empty)
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function refresh() {
    listPieces().then(setRows).catch((e) => setStatus(e.message))
    listCollections().then(setCollections).catch(() => {})
  }
  useEffect(refresh, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setStatus(null)
    try {
      await savePiece({ data: form })
      setForm(empty)
      setStatus('Pièce enregistrée.')
      refresh()
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Erreur lors de l’enregistrement.')
    } finally {
      setBusy(false)
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm('Supprimer définitivement cette pièce ?')) return
    try {
      await deletePiece({ data: { id } })
      refresh()
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
    }
  }

  return (
    <AdminShell title="Pièces">
      <form className="admin-form" onSubmit={onSubmit}>
        <h2>{form.id ? 'Modifier la pièce' : 'Nouvelle pièce'}</h2>
        <AdminField label="Collection">
          <select value={form.collection_id ?? ''} onChange={(e) => setForm({ ...form, collection_id: e.target.value || null })}>
            <option value="">— Aucune —</option>
            {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </AdminField>
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
        <thead><tr><th>Nom</th><th>Collection</th><th>Catégorie</th><th aria-label="Actions" /></tr></thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.collections?.name ?? '—'}</td>
              <td>{p.category}</td>
              <td className="admin-row-actions">
                <button aria-label={`Modifier ${p.name}`} onClick={() => setForm({ id: p.id, collection_id: p.collection_id, name: p.name, category: p.category, description: p.description, image_url: p.image_url, sort_order: p.sort_order })}><Pencil size={15} /></button>
                <button aria-label={`Supprimer ${p.name}`} onClick={() => onDelete(p.id)}><Trash2 size={15} /></button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={4}>Aucune pièce pour le moment.</td></tr>}
        </tbody>
      </table>
    </AdminShell>
  )
}
