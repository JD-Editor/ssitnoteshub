CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course text NOT NULL,
  semester int NOT NULL,
  subject text NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  size_bytes bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.documents TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Anyone can add documents" ON public.documents FOR INSERT WITH CHECK (true);

CREATE INDEX documents_course_sem_idx ON public.documents (course, semester);

CREATE POLICY "Anyone can read pdfs" ON storage.objects FOR SELECT USING (bucket_id = 'pdfs');
CREATE POLICY "Anyone can upload pdfs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pdfs');