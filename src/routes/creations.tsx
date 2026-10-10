import { createFileRoute } from '@tanstack/react-router'
import { Site, PageIntro, AppointmentBand, pageHead } from '@/components/couture/site'
import { CollectionGrid } from '@/components/couture/collections'
export const Route=createFileRoute('/creations')({head:()=>pageHead('Nos créations','Explorez les inspirations couture Omar Wally Fashion : tenues traditionnelles, mode homme, mode femme et cérémonie.'),component:Creations})
function Creations(){return <Site><PageIntro title="Des créations, une signature." eyebrow="NOS CRÉATIONS" description="Des silhouettes élégantes, des matières expressives et des détails qui font toute la différence."/><section className="editorial-section ivory-section"><CollectionGrid limit={4}/></section><AppointmentBand/></Site>}
