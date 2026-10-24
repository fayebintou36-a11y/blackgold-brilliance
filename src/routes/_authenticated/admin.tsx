import { pageHead } from '@/components/couture/site'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/admin')({
  head: () => ({meta:[...pageHead('Administration — Administration','Gestion sécurisée de la maison Omar Wally Fashion.').meta,{name:'robots',content:'noindex'}]}),
  component: () => <Outlet />,
})
