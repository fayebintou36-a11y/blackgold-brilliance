import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import d1 from '@/assets/defile/defile-1.jpeg.asset.json'
import d2 from '@/assets/defile/defile-2.jpeg.asset.json'
import d3 from '@/assets/defile/defile-3.jpeg.asset.json'
import d4 from '@/assets/defile/defile-4.jpeg.asset.json'
import d5 from '@/assets/defile/defile-5.jpeg.asset.json'
import d6 from '@/assets/defile/defile-6.jpeg.asset.json'
import d7 from '@/assets/defile/defile-7.jpeg.asset.json'
import d8 from '@/assets/defile/defile-8.jpeg.asset.json'
import d9 from '@/assets/defile/defile-9.jpeg.asset.json'
import d10 from '@/assets/defile/defile-10.jpeg.asset.json'

const looks = [
  { src: d1.url, title: 'Grand boubou noir', alt: 'Homme en grand boubou noir à motifs géométriques dorés et blancs' },
  { src: d2.url, title: 'Bazin noir brodé or', alt: 'Femme en boubou bazin noir brodé d’or, bras ouverts' },
  { src: d3.url, title: 'Duo cérémonie', alt: 'Deux hommes en grands boubous violet et ivoire brodés' },
  { src: d4.url, title: 'Corail brodé', alt: 'Femme en boubou corail à plastron brodé' },
  { src: d5.url, title: 'Le défilé', alt: 'Mannequins en tenues sénégalaises colorées lors d’un défilé' },
  { src: d6.url, title: 'Envol noir et or', alt: 'Femme en boubou noir brodé d’or, manches déployées' },
  { src: d7.url, title: 'Corail en mouvement', alt: 'Femme en boubou corail aux larges manches déployées' },
  { src: d8.url, title: 'Couple signature', alt: 'Couple en boubous noirs brodés d’or assortis' },
  { src: d9.url, title: 'Blanc et or', alt: 'Femme en boubou blanc à broderies dorées' },
  { src: d10.url, title: 'Duo ivoire', alt: 'Couple en tenues blanches brodées assorties' },
]

export function Runway3D() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const n = looks.length
  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = window.setInterval(() => setActive((a) => (a + 1) % n), 4200)
    return () => window.clearInterval(t)
  }, [paused, n])
  const go = (d: number) => setActive((a) => (a + d + n) % n)

  return (
    <section className="runway-section" aria-label="Défilé 3D des créations">
      <div className="runway-head">
        <p className="eyebrow">LE DÉFILÉ</p>
        <h2>Sur le podium Omar Wally</h2>
        <p>Une sélection de nos tenues, présentée comme sur un podium.</p>
      </div>
      <div className="runway-stage" onKeyDown={(e) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1) }}>
        <div className="runway-floor" aria-hidden="true" />
        {looks.map((l, i) => {
          let off = i - active
          if (off > n / 2) off -= n
          if (off < -n / 2) off += n
          const abs = Math.abs(off)
          return (
            <button
              key={l.src}
              type="button"
              className={`runway-card${off === 0 ? ' is-active' : ''}`}
              style={{
                transform: `translateX(${off * 58}%) translateZ(${-abs * 160}px) rotateY(${off * -24}deg)`,
                opacity: abs > 3 ? 0 : 1 - abs * 0.18,
                zIndex: 20 - abs,
                pointerEvents: abs > 3 ? 'none' : undefined,
              }}
              aria-label={`Afficher ${l.title}`}
              aria-current={off === 0}
              tabIndex={abs > 3 ? -1 : 0}
              onClick={() => setActive(i)}
            >
              <img src={l.src} alt={l.alt} loading={abs < 2 ? 'eager' : 'lazy'} />
              <span className="runway-shine" aria-hidden="true" />
            </button>
          )
        })}
      </div>
      <div className="runway-caption" aria-live="polite">
        <span>{String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
        <strong key={active}>{looks[active]?.title}</strong>
      </div>
      <div className="runway-controls">
        <button type="button" onClick={() => go(-1)} aria-label="Tenue précédente"><ChevronLeft size={20} /></button>
        <button type="button" onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Reprendre le défilé' : 'Mettre le défilé en pause'}>{paused ? <Play size={18} /> : <Pause size={18} />}</button>
        <button type="button" onClick={() => go(1)} aria-label="Tenue suivante"><ChevronRight size={20} /></button>
      </div>
    </section>
  )
}
