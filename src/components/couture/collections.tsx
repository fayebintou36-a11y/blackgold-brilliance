import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import bronze from '@/assets/collection-bronze.jpeg.asset.json'
import silver from '@/assets/collection-argent.jpeg.asset.json'
import black from '@/assets/collection-signature-noire.jpeg.asset.json'
import { usePublicContent } from '@/lib/public-content'

export type Creation = { name: string; category: string; description: string; image: string; illustrative: boolean; framing: string; id?: string; featured: boolean }

// Fallback shown until photos are added from the administration.
export const creations: Creation[] = [
  { name: 'Éclat de bronze', category: 'Tenues traditionnelles', description: 'Un boubou aux reflets bronze, ponctué de motifs brodés et d’une allure singulière.', image: bronze.url, illustrative: false, framing: 'collection-full-length', featured: false },
  { name: 'Élégance argentée', category: 'Mode femme', description: 'Une silhouette lumineuse, un drapé généreux et des détails contrastés sur le podium.', image: silver.url, illustrative: false, framing: 'collection-runway', featured: false },
  { name: 'Signature noire', category: 'Mode homme', description: 'La profondeur du noir rencontre la force des motifs et la précision du détail.', image: black.url, illustrative: false, framing: 'collection-black', featured: false },
]

export function useCreations(section: 'creations' | 'galerie' = 'creations'): Creation[] {
  const content = usePublicContent()
  const rows = content.pieces.filter((p) => p.section === section)
  if (rows.length === 0 && section === 'creations') return creations
  return rows.map((c) => ({ name: c.name, category: c.category, description: c.description, image: c.image_url, illustrative: false, framing: '', id: c.id, featured: c.featured }))
}

export function CollectionGrid({ limit = 3 }: { limit?: number }) {
  const grid = useRef<HTMLDivElement>(null)
  const data = useCreations('creations')
  const featured = data.filter((c) => c.featured)
  const visible = (featured.length > 0 ? featured : data).slice(0, limit)
  useEffect(() => {
    const tiles = grid.current?.querySelectorAll<HTMLElement>('.collection-tile')
    if (!tiles || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver((entries) => { entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.remove('collection-pending'); observer.unobserve(entry.target) } }) }, { threshold: 0.12 })
    tiles.forEach((tile) => { tile.classList.add('collection-pending'); observer.observe(tile) })
    return () => { observer.disconnect(); tiles.forEach((tile) => tile.classList.remove('collection-pending')) }
  }, [limit, data.length])
  return <><div ref={grid} className="collection-grid collection-editorial">{visible.map((c, i) => <article key={c.id ?? c.name} className="collection-tile"><Link to="/creations" className="collection-photo-link block" aria-label={`Découvrir ${c.name}`}><div className={`collection-image ${c.framing}`}><img src={c.image} alt={c.name + (c.illustrative ? ' — photographie illustrative de couture' : ' — tenue sénégalaise')} width={500} height={1024} loading="lazy" /><span className="collection-number" aria-hidden="true">0{i + 1}</span><span className="collection-photo-action" aria-hidden="true"><ArrowUpRight size={20} /></span></div></Link><p className="collection-category">{c.category}</p><h3>{c.name}</h3><p className="collection-description">{c.description}</p><Link to="/creations" className="collection-discover">DÉCOUVRIR <ArrowUpRight size={14} /></Link></article>)}</div>{visible.some((c) => c.illustrative) && <p className="illustration-note">Photographie d’inspiration générée, ne représentant pas une réalisation de la maison.</p>}</>
}
