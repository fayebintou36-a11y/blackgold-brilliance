import { AdminImage } from '@/components/couture/admin-image'
import { useServerFn } from '@tanstack/react-start'
import { pageHead } from '@/components/couture/site'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Pencil, Trash2, Plus, ArrowUp, ArrowDown, Star } from 'lucide-react'
import { AdminShell, AdminField } from '@/components/couture/admin'
import { Button } from '@/components/ui/button'
import { listPieces, savePiece, deletePiece, movePiece } from '@/lib/admin.functions'

type Piece = {
  id: string
  name: string
  category: string
  description: string
  image_url: string
  sort_order: number
  section: 'creations' | 'galerie'
  featured: boolean
}

const empty = { name: '', category: '', description: '', image_url: '', sort_order: 0, section: 'creations' as 'creations' | 'galerie', featured: false }

const sectionLabels: Record<string, string> = { creations: 'Nos créations', galerie: 'Galerie' }

export const Route = createFileRoute('/_authenticated/admin/pieces')({
  head: () => ({ meta: [...pageHead('Photos — Administration', 'Gestion sécurisée de la maison Omar Wally Fashion.').meta, { name: 'robots', content: 'noindex' }] }),
  component: AdminPieces,
})

function AdminPieces() {
  const listPiecesFn = useServerFn(listPieces)
  const savePieceFn = useServerFn(savePiece)
  const deletePieceFn = useServerFn(deletePiece)
  const movePieceFn = useServerFn(movePiece)

  const [rows, setRows] = useState<Piece[]>([])
  const [form, setForm] = useState<typeof empty & { id?: string }>(empty)
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function refresh() {
    listPiecesFn().then((data) => setRows(data as Piece[])).catch((e) => setStatus(e.message))
  }
  useEffect(refresh, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setStatus(null)
    try {
      await savePieceFn({ data: { ...form, collection_id: null } })
      setForm(empty)
      setStatus('Photo enregistrée.')
      refresh()
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Erreur lors de l’enregistrement.')
    } finally {
      setBusy(false)
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm('Supprimer définitivement cette photo ?')) return
    try {
      await deletePieceFn({ data: { id } })
      refresh()
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
    }
  }

  async function onMove(id: string, direction: 'up' | 'down') {
    try {
      await movePieceFn({ data: { id, direction } })
      refresh()
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Erreur lors de la réorganisation.')
    }
  }

  function siblingsOf(p: Piece) {
    return rows.filter((r) => r.section === p.section)
  }

  return (
    <AdminShell title="Photos">
      <form className="admin-form" onSubmit={onSubmit}>
        <h2>{form.id ? 'Modifier la photo' : 'Nouvelle photo'}</h2>
        <AdminField label="Rubrique">
          <select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value as 'creations' | 'galerie' })}>
            <option value="creations">Nos créations</option>
            <option value="galerie">Galerie</option>
          </select>
        </AdminField>
        <AdminField label="Titre"><input required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></AdminField>
        <AdminField label="Catégorie"><input value={form.category} placeholder="Ex. Défilés, Événements, Mode femme…" onChange={(e) => setForm({ ...form, category: e.target.value })} /></AdminField>
        <AdminField label="Description"><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></AdminField>
        <AdminImage value={form.image_url} onChange={(image_url) => setForm({ ...form, image_url })} />
        <AdminField label="Ordre d’affichage"><input type="number" min={0} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></AdminField>
        <label className="admin-checkbox"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /><span>Mettre en avant sur la page d’accueil</span></label>
        <div className="admin-form-actions">
          <Button variant="couture" type="submit" disabled={busy}>{form.id ? 'ENREGISTRER' : <><Plus size={14} /> AJOUTER</>}</Button>
          {form.id && <Button variant="coutureOutline" type="button" onClick={() => setForm(empty)}>ANNULER</Button>}
        </div>
        {status && <p className="admin-status" role="status">{status}</p>}
      </form>

      <table className="admin-table">
        <thead><tr><th>Photo</th><th>Titre</th><th>Rubrique</th><th>Catégorie</th><th aria-label="Ordre" /><th aria-label="Actions" /></tr></thead>
        <tbody>
          {rows.map((p) => {
            const siblings = siblingsOf(p)
            const index = siblings.findIndex((s) => s.id === p.id)
            return (
              <tr key={p.id}>
                <td data-label="Photo">{p.image_url && <img className="admin-thumb" src={p.image_url} alt="" width={48} height={48} loading="lazy" />}</td>
                <td data-label="Titre">{p.name}{p.featured && <Star size={13} className="admin-star" aria-label="Mise en avant" />}</td>
                <td data-label="Rubrique">{sectionLabels[p.section] ?? p.section}</td>
                <td data-label="Catégorie">{p.category}</td>
                <td className="admin-row-actions">
                  <Button variant="ghost" size="icon" aria-label={`Monter ${p.name}`} disabled={index <= 0} onClick={() => onMove(p.id, 'up')}><ArrowUp size={15} /></Button>
                  <Button variant="ghost" size="icon" aria-label={`Descendre ${p.name}`} disabled={index === siblings.length - 1} onClick={() => onMove(p.id, 'down')}><ArrowDown size={15} /></Button>
                </td>
                <td className="admin-row-actions">
                  <Button variant="ghost" size="icon" aria-label={`Modifier ${p.name}`} onClick={() => setForm({ id: p.id, name: p.name, category: p.category, description: p.description, image_url: p.image_url, sort_order: p.sort_order, section: p.section, featured: p.featured })}><Pencil size={15} /></Button>
                  <Button variant="ghost" size="icon" aria-label={`Supprimer ${p.name}`} onClick={() => onDelete(p.id)}><Trash2 size={15} /></Button>
                </td>
              </tr>
            )
          })}
          {rows.length === 0 && <tr><td colSpan={6}>Aucune photo pour le moment.</td></tr>}
        </tbody>
      </table>
    </AdminShell>
  )
}
