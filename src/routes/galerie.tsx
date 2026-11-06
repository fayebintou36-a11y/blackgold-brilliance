import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Expand } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Site, PageIntro, pageHead } from '@/components/couture/site'
import { useCreations } from '@/components/couture/collections'
import { PhotoLightbox } from '@/components/couture/photo-lightbox'

export const Route = createFileRoute('/galerie')({ head: () => pageHead('Galerie', 'Défilés, événements, séances photo et moments forts de la maison Omar Wally Fashion.'), component: Gallery })

function Gallery() {
  const photos = useCreations('galerie')
  const [filter, setFilter] = useState('Tout')
  const [selected, setSelected] = useState<number | null>(null)
  const categories = ['Tout', ...Array.from(new Set(photos.map((p) => p.category).filter(Boolean)))]
  const filtered = photos.filter((c) => filter === 'Tout' || c.category === filter)
  return <Site><PageIntro title="L’élégance en images." eyebrow="LA GALERIE" description="Défilés, événements, séances photo et moments forts de la maison." /><section className="editorial-section">{categories.length > 2 && <div className="filters" aria-label="Catégories">{categories.map((c) => <Button key={c} variant="ghost" className="filter-button" aria-pressed={filter === c} onClick={() => { setFilter(c); setSelected(null) }}>{c}</Button>)}</div>}<div className="collection-grid">{filtered.map((c, i) => <article key={c.id ?? c.name}><Button className="gallery-trigger" aria-label={`Agrandir ${c.name}`} onClick={() => setSelected(i)}><div className={`collection-image ${c.framing}`}><img src={c.image} alt={c.name} width={500} height={1024} loading="lazy" /><Expand className="absolute bottom-4 right-4 text-foreground" /></div></Button><h3 className="mt-4 text-2xl">{c.name}</h3><p className="mt-2 text-xs text-muted-foreground">{c.category}</p></article>)}</div>{filtered.length === 0 && <p className="prose-copy py-12">Les photographies de cette rubrique seront présentées prochainement.</p>}</section><PhotoLightbox items={filtered} selected={selected} onClose={() => setSelected(null)} onSelect={setSelected} /></Site>
}
