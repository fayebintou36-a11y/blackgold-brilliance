import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'

export type LightboxItem = { name: string; category: string; image: string; description?: string }

export function PhotoLightbox({ items, selected, onClose, onSelect }: { items: LightboxItem[]; selected: number | null; onClose: () => void; onSelect: (index: number) => void }) {
  const current = selected === null ? undefined : items[selected]
  return (
    <Dialog open={current !== undefined} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-3xl">
        <DialogTitle>{current?.name}</DialogTitle>
        <DialogDescription>{current?.category}{current?.description ? ` — ${current.description}` : ''}</DialogDescription>
        {current && <img className="lightbox-image" src={current.image} alt={current.name} />}
        <div className="lightbox-controls">
          <Button variant="ghost" size="icon" aria-label="Photo précédente" disabled={items.length < 2} onClick={() => onSelect(selected === null ? 0 : (selected - 1 + items.length) % items.length)}><ChevronLeft /></Button>
          <span className="text-xs text-muted-foreground">{selected === null ? 0 : selected + 1} / {items.length}</span>
          <Button variant="ghost" size="icon" aria-label="Photo suivante" disabled={items.length < 2} onClick={() => onSelect(selected === null ? 0 : (selected + 1) % items.length)}><ChevronRight /></Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
