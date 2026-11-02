import { useEffect, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import seated from '@/assets/couture-scene-assise.jpeg.asset.json'
import silhouette from '@/assets/couture-scene-silhouette.jpeg.asset.json'
import embroidery from '@/assets/couture-scene-broderie.jpeg.asset.json'
import volume from '@/assets/couture-scene-volume.jpeg.asset.json'

const photos = [
  { source: seated, alt: 'Boubou argenté aux broderies dorées, porté sur scène' },
  { source: silhouette, alt: 'Silhouette en boubou argenté, bras levé sur scène' },
  { source: embroidery, alt: 'Boubou argenté et détails de broderie sous les lumières de la scène' },
  { source: volume, alt: 'Volume et ampleur d’un boubou rose et doré, déployé sur scène' },
]

export function HomePhotos() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(preference.matches)
    update()
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    if (paused || reduced) return
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive(previous => (previous + 1) % photos.length)
    }, 6500)
    return () => window.clearInterval(timer)
  }, [paused, reduced])
  return <>
    <div className="home-photo-stage" aria-label="Photographies de couture sur scène">
      {photos.map((photo, index) => <img key={photo.source.url} className={`hero-image scene-photo${active === index ? ' scene-photo-active' : ''}`} src={photo.source.url} alt={photo.alt} aria-hidden={active !== index} width={index === 0 ? 768 : 720} height={index === 0 ? 1064 : 1280} fetchPriority={index === 0 ? 'high' : 'auto'} />)}
    </div>
    <div className="home-photo-controls" aria-label="Choisir une photo">
      {photos.map((photo, index) => <Button key={photo.source.url} variant="ghost" size="icon" className="home-photo-dot" aria-label={`Afficher la photo ${index + 1}`} aria-pressed={active === index} onClick={() => { setActive(index); setPaused(true) }}><span /></Button>)}
      {!reduced && <Button variant="ghost" size="icon" className="home-photo-pause" aria-label={paused ? 'Reprendre le défilement' : 'Mettre le défilement en pause'} title={paused ? 'Reprendre le défilement' : 'Mettre le défilement en pause'} onClick={() => setPaused(previous => !previous)}>{paused ? <Play size={14} /> : <Pause size={14} />}</Button>}
    </div>
  </>
}