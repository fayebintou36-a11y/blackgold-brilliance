import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Quote } from 'lucide-react'
import portrait from '@/assets/omar-diouf-portrait.jpeg.asset.json'
import atelier from '@/assets/omar-diouf-atelier.jpeg.asset.json'

export function FounderSection() {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className={`founder-section ${visible ? 'is-visible' : ''}`} aria-label="Le fondateur">
      <div className="founder-layout">
        <div className="founder-portraits">
          <figure className="founder-portrait founder-portrait-main">
            <img src={portrait.url} alt="Omar Diouf, fondateur d'Omar Wally Fashion, en boubou bleu brodé" width={744} height={1049} loading="lazy" />
          </figure>
          <figure className="founder-portrait founder-portrait-secondary">
            <img src={atelier.url} alt="Omar Diouf en grand boubou vert brodé d'or" width={852} height={1280} loading="lazy" />
          </figure>
          <span className="founder-badge" aria-hidden="true">
            <strong>20+</strong>
            <span>ans de couture</span>
          </span>
        </div>
        <div className="founder-copy">
          <span className="eyebrow">LE FONDATEUR</span>
          <h2>
            Omar <em>Diouf</em>
          </h2>
          <p className="founder-role">Fondateur &amp; directeur artistique — Omar Wally Fashion</p>
          <p className="prose-copy">
            Plus de vingt ans de carrière au service de la couture sénégalaise. Omar Diouf a fait de
            l'exigence sa signature : chaque coupe, chaque broderie, chaque finition porte l'empreinte
            d'un savoir-faire transmis, affiné et réinventé saison après saison.
          </p>
          <blockquote className="founder-quote">
            <Quote size={22} aria-hidden="true" />
            <p>
              « L'élégance n'est pas un vêtement que l'on porte, c'est une histoire que l'on raconte.
              Ma mission : que chaque client quitte l'atelier en étant la plus belle version de
              lui-même. »
            </p>
            <cite>— Omar Diouf</cite>
          </blockquote>
          <Link to="/a-propos" className="text-link">
            DÉCOUVRIR LA MAISON <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  )
}
