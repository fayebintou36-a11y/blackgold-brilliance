import { useLocation } from '@tanstack/react-router'
import { usePublicContent } from '@/lib/public-content'

export function usePageText(section:string, fallback:React.ReactNode) {
  const { pathname } = useLocation()
  const page = pathname === '/' ? 'accueil' : pathname.slice(1)
  const { contents } = usePublicContent()
  return contents.find(c=>c.page===page && c.section===section)?.content ?? fallback
}
export function EditableText({section,children}:{section:string;children:React.ReactNode}) {
  return <>{usePageText(section,children)}</>
}