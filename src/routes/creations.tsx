import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { Expand } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Site, PageIntro, AppointmentBand, pageHead } from '@/components/couture/site'
import { useCreations } from '@/components/couture/collections'
import { PhotoLightbox } from '@/components/couture/photo-lightbox'
import { Runway3D } from '@/components/couture/runway-3d'

export const Route = createFileRoute('/creations')({ head: () => pageHead('Nos créations', 'Explorez les tenues confectionnées par Omar Wally Fashion : tenues traditionnelles, mode homme, mode femme et cérémonie.'), component: Creations })

function Creations() {
  const data = useCreations('creations')
  const [selected, setSelected] = useState<number | null>(null)
  const grid = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const tiles = grid.current?.querySelectorAll<HTMLElement>('.collection-tile')
    if (!tiles || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver((entries) => { entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.remove('collection-pending'); observer.unobserve(entry.target) } }) }, { threshold: 0.12 })
    tiles.forEach((tile) => { tile.classList.add('collection-pending'); observer.observe(tile) })
    return () => { observer.disconnect(); tiles.forEach((tile) => tile.classList.remove('collection-pending')) }
  }, [data.length])
  return <Site><PageIntro title="Des créations, une signature." eyebrow="NOS CRÉATIONS" description="Des silhouettes élégantes, des matières expressives et des détails qui font toute la différence." /><Runway3D /><section className="editorial-section ivory-section"><div ref={grid} className="collection-grid collection-editorial">{data.map((c, i) => <article key={c.id ?? c.name} className="collection-tile"><Button className="gallery-trigger" aria-label={`Agrandir ${c.name}`} onClick={() => setSelected(i)}><div className={`collection-image ${c.framing}`}><img src={c.image} alt={c.name + ' — tenue sénégalaise'} width={500} height={1024} loading="lazy" /><span className="collection-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><Expand className="absolute bottom-4 right-4 text-foreground" /></div></Button><p className="collection-category">{c.category}</p><h3>{c.name}</h3><p className="collection-description">{c.description}</p></article>)}</div>{data.length === 0 && <p className="prose-copy py-12">Les créations seront présentées prochainement.</p>}</section><PhotoLightbox items={data} selected={selected} onClose={() => setSelected(null)} onSelect={setSelected} /><AppointmentBand /></Site>
}
