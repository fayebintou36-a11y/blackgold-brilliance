import { useEffect, useRef } from 'react'
import { Award } from 'lucide-react'
import remisePrix from '@/assets/distinction-remise-prix.jpeg.asset.json'
import tropheesAtelier from '@/assets/distinction-trophees-atelier.jpeg.asset.json'
import grandPrix from '@/assets/distinction-grand-prix.jpeg.asset.json'

const awards = [
  { image: remisePrix.url, title: 'Remise de prix', caption: 'Une couture reconnue', alt: 'Omar Diouf recevant un trophée sur scène' },
  { image: tropheesAtelier.url, title: 'L’atelier couronné', caption: 'Meilleur tailleur de l’année', alt: 'Omar Diouf devant les trophées de l’atelier Omar Wally Fashion' },
  { image: grandPrix.url, title: 'Grand prix', caption: 'L’excellence en héritage', alt: 'Remise d’un grand prix à Omar Diouf lors d’une cérémonie' },
]

export function AdvisorAwards() {
  const strip = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const node = strip.current
    if (!node || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    node.classList.add('awards-pending')
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { node.classList.remove('awards-pending'); observer.disconnect() }
    }, { threshold: 0.2 })
    observer.observe(node)
    return () => { observer.disconnect(); node.classList.remove('awards-pending') }
  }, [])
  return (
    <div className="advisor-awards" ref={strip}>
      <div className="awards-heading">
        <span className="eyebrow"><Award size={13} /> DISTINCTIONS</span>
        <p>Une maison primée, une exigence reconnue.</p>
      </div>
      <div className="awards-grid">
        {awards.map((award, index) => (
          <figure className="award-card" key={award.title} style={{ transitionDelay: `${index * 0.15}s` }}>
            <div className="award-frame"><img src={award.image} alt={award.alt} loading="lazy" /></div>
            <figcaption>
              <span className="award-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="award-title">{award.title}</span>
              <span className="award-caption">{award.caption}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
