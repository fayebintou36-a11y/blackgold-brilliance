CREATE POLICY "Public can read published couture images" ON storage.objects FOR SELECT TO anon, authenticated USING (
  bucket_id = 'couture-images' AND (
    EXISTS (SELECT 1 FROM public.pieces p WHERE p.image_url = '/api/public/couture-image?file=' || storage.objects.name)
    OR EXISTS (SELECT 1 FROM public.collections c WHERE c.image_url = '/api/public/couture-image?file=' || storage.objects.name)
  )
);