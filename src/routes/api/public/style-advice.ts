import { createFileRoute } from '@tanstack/react-router'
import { handleStyleAdvice } from '@/lib/style-advice.server'

export const Route = createFileRoute('/api/public/style-advice')({
  server: { handlers: { POST: ({ request }) => handleStyleAdvice(request) } },
})