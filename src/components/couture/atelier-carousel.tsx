import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play, Scissors } from 'lucide-react'
import type { RunwayLook } from '@/components/couture/runway-3d'

// Rotating "atelier rack": photos hang on a 3D ring like garments on a couture rail.
export function AtelierCarousel({ items }: { items: RunwayLook[] }) {
  const n = items.length
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const drag = useRef<number | null>(null)
  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = window.setInterval(() => setActive((a) => a + 1), 3800)
    return () => window.clearInterval(t)
  }, [paused])
  const step = 360 / n
  const current = ((active % n) + n) % n
  return (
    <section className="atelier-ring-section" aria-label="Galerie 3D de l’atelier">
      <div className="runway-head">
        <p className="eyebrow">LE PORTANT DE L’ATELIER</p>
        <h2>Chaque tenue, <em>sous tous ses angles.</em></h2>
        <p>Nos créations tournent comme sur le portant de l’atelier : faites glisser ou choisissez une tenue.</p>
      </div>
      <div className="atelier-ring-stage"
        onPointerDown={(e) => { drag.current = e.clientX }}
        onPointerUp={(e) => { if (drag.current !== null) { const d = e.clientX - drag.current; if (Math.abs(d) > 30) setActive((a) => a + (d < 0 ? 1 : -1)) } drag.current = null }}
        onKeyDown={(e) => { if (e.key === 'ArrowRight') setActive((a) => a + 1); if (e.key === 'ArrowLeft') setActive((a) => a - 1) }}>
        <div className="atelier-rail" aria-hidden="true"><Scissors size={16} /></div>
        <div className="atelier-ring" style={{ transform: `translateZ(calc(var(--ring-r) * -1)) rotateY(${-active * step}deg)` }}>
          {items.map((l, i) => (
            <button key={l.src} type="button" className={`atelier-garment${i === current ? ' is-active' : ''}`}
              style={{ transform: `rotateY(${i * step}deg) translateZ(var(--ring-r))` }}
              aria-label={`Afficher ${l.title}`} aria-current={i === current}
              onClick={() => setActive((a) => a + ((((i - current) % n) + n + Math.floor(n / 2)) % n) - Math.floor(n / 2))}>
              <span className="atelier-hanger" aria-hidden="true" />
              <img src={l.src} alt={l.alt} loading="lazy" decoding="async" draggable={false} />
            </button>
          ))}
        </div>
        <div className="atelier-floor" aria-hidden="true" />
      </div>
      <div className="runway-caption" aria-live="polite">
        <span>{String(current + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
        <strong key={current}>{items[current]?.title}</strong>
      </div>
      <div className="runway-controls">
        <button type="button" onClick={() => setActive((a) => a - 1)} aria-label="Tenue précédente"><ChevronLeft size={20} /></button>
        <button type="button" onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Reprendre la rotation' : 'Mettre en pause'}>{paused ? <Play size={18} /> : <Pause size={18} />}</button>
        <button type="button" onClick={() => setActive((a) => a + 1)} aria-label="Tenue suivante"><ChevronRight size={20} /></button>
      </div>
    </section>
  )
}
