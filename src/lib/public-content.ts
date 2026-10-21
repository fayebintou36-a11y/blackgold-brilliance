import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { getPublicContent } from './public-content.functions'

export const publicContentOptions = queryOptions({queryKey:['public-content'],queryFn:()=>getPublicContent(),staleTime:0})
export function usePublicContent() { return useSuspenseQuery(publicContentOptions).data }