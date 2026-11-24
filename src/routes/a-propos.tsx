import { createFileRoute } from '@tanstack/react-router'
import { Scissors } from 'lucide-react'
import { Site, PageIntro, AppointmentBand, pageHead } from '@/components/couture/site'
import hero from '@/assets/a-propos-bazin-bleu.jpeg.asset.json'

const pillars = [
  { n: '01', title: 'L’écoute', copy: 'Votre occasion, votre style, votre personnalité : tout commence par une conversation.' },
  { n: '02', title: 'La coupe', copy: 'Des volumes justes et des lignes nettes, ajustés à votre silhouette.' },
  { n: '03', title: 'La broderie', copy: 'Des motifs tracés avec patience, qui signent chaque pièce.' },
]

export const Route = createFileRoute('/a-propos')({ head: () => pageHead('La maison', 'La vision Omar Wally Fashion : des vêtements élégants, une confection sur mesure et le soin du détail.'), component: About })

function About() {
  return <Site>
    <PageIntro title="Une signature unique." eyebrow="LA MAISON OMAR WALLY" description="Une vision de la couture, nourrie par l’élégance et l’attention portée à chaque détail." />
    <section className="editorial-section about-grid about-legend">
      <div className="about-legend-copy">
        <span className="eyebrow">L’ÉLÉGANCE DANS CHAQUE DÉTAIL</span>
        <h2>Le bazin se porte<br /><em>comme une légende.</em></h2>
        <div className="hero-rule" aria-hidden="true"><span /><Scissors size={14} /><span /></div>
        <p className="prose-copy">Omar Wally Fashion façonne des tenues qui racontent une histoire : celle d’un savoir-faire sénégalais, d’un tissu noble et d’une allure assumée. Des silhouettes traditionnelles aux tenues de cérémonie, chaque pièce naît d’une exigence — la coupe, la broderie, la finition.</p>
        <blockquote className="about-quote">« Un vêtement réussi ne se remarque pas seulement : il se raconte. »</blockquote>
        <ol className="about-pillars">{pillars.map(p => <li key={p.n}><span>{p.n}</span><div><h3>{p.title}</h3><p>{p.copy}</p></div></li>)}</ol>
      </div>
      <figure className="about-portrait about-legend-figure">
        <div className="about-legend-frame"><img className="about-image" src={hero.url} alt="Homme en tenue de bazin bleu roi à broderie ton sur ton, dans l’atelier Omar Wally Fashion" width={854} height={1280} loading="lazy" /></div>
        <figcaption className="about-legend-caption"><span>BAZIN BLEU ROI · BRODERIE TON SUR TON</span><em>L’élégance sénégalaise, signée Omar Wally Fashion.</em></figcaption>
      </figure>
    </section>
    <AppointmentBand />
  </Site>
}
