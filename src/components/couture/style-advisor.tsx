import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, LoaderCircle, Sparkles, Square } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'

export function StyleAdvisor() {
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const controller = useRef<AbortController | null>(null)
  useEffect(() => () => controller.current?.abort(), [])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const abort = new AbortController()
    controller.current = abort
    setLoading(true); setText(''); setError('')
    try {
      const response = await fetch('/api/public/style-advice', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: abort.signal,
        body: JSON.stringify({ occasion: form.get('occasion'), preferences: form.get('preferences'), budget: Number(form.get('budget')), currency: form.get('currency') }),
      })
      if (!response.ok) { const data = await response.json(); throw new Error(data.message ?? 'Le service est indisponible.') }
      const reader = response.body?.getReader()
      if (!reader) throw new Error('Aucune réponse reçue.')
      const decoder = new TextDecoder()
      let buffer = ''
      let complete = false
      const consume = (line: string) => {
        if (!line.trim()) return
        const part = JSON.parse(line)
        if (part.error) throw new Error(part.error)
        if (part.text) setText(previous => previous + part.text)
        if (part.done) complete = true
      }
      while (true) {
        const chunk = await reader.read()
        if (chunk.done) break
        buffer += decoder.decode(chunk.value, { stream: true })
        const lines = buffer.split('\n'); buffer = lines.pop() ?? ''
        lines.forEach(consume)
      }
      consume(buffer)
      if (!complete) throw new Error('La réponse a été interrompue. Vous pouvez lancer une nouvelle demande.')
    } catch (caught) {
      if (abort.signal.aborted) setError('Demande arrêtée.')
      else setError(caught instanceof Error ? caught.message : 'Le service est indisponible.')
    } finally { setLoading(false); controller.current = null }
  }
  return <section className="editorial-section style-advisor" id="conseiller" aria-labelledby="advisor-title">
    <div className="section-heading"><div><span className="eyebrow"><Sparkles size={14}/> VOTRE INSPIRATION SUR MESURE</span><h2 id="advisor-title">Une occasion. <em>Votre allure.</em></h2></div><span className="advisor-label">CONSEILLER COUTURE · IA</span></div>
    <div className="advisor-layout">
      <form className="appointment-form advisor-form" onSubmit={submit}>
        <label className="form-wide">Votre occasion<input name="occasion" placeholder="Mariage à Dakar, baptême, soirée…" required minLength={3} maxLength={400} disabled={loading}/></label>
        <label className="form-wide">Vos envies<textarea name="preferences" rows={4} placeholder="Couleurs, matières, coupe, pièces souhaitées…" required minLength={3} maxLength={1200} disabled={loading}/></label>
        <label>Budget maximum<input type="number" name="budget" placeholder="75 000" required min="1" step="any" disabled={loading}/></label>
        <label>Devise<select name="currency" defaultValue="XOF" disabled={loading}><option value="XOF">FCFA (XOF)</option><option value="EUR">Euro (EUR)</option></select></label>
        <div className="form-wide advisor-actions"><Button variant="couture" type="submit" disabled={loading}>{loading ? <><LoaderCircle className="advisor-spinner"/> CRÉATION DE VOS CONSEILS</> : <>TROUVER MON INSPIRATION <ArrowUpRight/></>}</Button>{loading && <Button variant="coutureOutline" type="button" onClick={() => controller.current?.abort()}><Square size={12}/> ARRÊTER</Button>}</div>
        <p className="form-wide advisor-note">Vos descriptions sont transmises au service IA pour cette demande. Évitez les informations personnelles. Inspirations, sans engagement ; devis à confirmer avec l’atelier.</p>
      </form>
      <div className="advisor-result" aria-busy={loading}>
        {!text && !error && <div className="advisor-empty"><Sparkles/><h3>Votre prochaine signature</h3><span>01 — L’occasion<br/>02 — Vos envies<br/>03 — Votre budget</span></div>}
        {loading && <p role="status" className="advisor-status">{text ? 'Vos conseils prennent forme…' : 'L’atelier d’inspiration compose vos propositions…'}</p>}
        {error && <p role="alert" className="advisor-error">{error}</p>}
        {text && <><div className="advice-prose"><ReactMarkdown components={{ a: ({ children }) => <span>{children}</span> }}>{text}</ReactMarkdown></div>{!loading && !error && <Button variant="coutureOutline" asChild><a href="tel:773735370">EN PARLER À L’ATELIER <ArrowUpRight/></a></Button>}</>}
      </div>
    </div>
  </section>
}