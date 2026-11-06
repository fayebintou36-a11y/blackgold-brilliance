ALTER TABLE public.pieces ADD COLUMN section text NOT NULL DEFAULT 'creations';
ALTER TABLE public.pieces ADD COLUMN featured boolean NOT NULL DEFAULT false;
COMMENT ON COLUMN public.pieces.section IS 'Rubrique du site : creations (Nos créations) ou galerie (défilés, événements).';
COMMENT ON COLUMN public.pieces.featured IS 'Photo mise en avant sur la page d''accueil.';
COMMENT ON COLUMN public.pieces.collection_id IS 'DEPRECATED: la rubrique section remplace le rattachement à une collection.';