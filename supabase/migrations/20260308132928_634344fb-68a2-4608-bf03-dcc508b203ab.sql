
-- Curriculum resources table for admin-uploaded training data
CREATE TABLE public.curriculum_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  resource_type text NOT NULL DEFAULT 'syllabus', -- syllabus, past_paper, reference_material
  institution text NOT NULL,
  program text NOT NULL,
  education_level text, -- diploma, degree
  exam_type text, -- semester, board
  content_text text, -- extracted text content
  file_name text,
  file_path text,
  file_size integer,
  file_type text,
  uploaded_by uuid REFERENCES auth.users(id),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups by institution+program
CREATE INDEX idx_curriculum_institution_program ON public.curriculum_resources(institution, program);
CREATE INDEX idx_curriculum_education_level ON public.curriculum_resources(education_level);

-- RLS
ALTER TABLE public.curriculum_resources ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage curriculum resources"
  ON public.curriculum_resources FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Authenticated users can read active resources matching their profile (read-only)
CREATE POLICY "Users can read matching curriculum resources"
  ON public.curriculum_resources FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND institution = (SELECT institution FROM public.profiles WHERE id = auth.uid())
    AND program = (SELECT program FROM public.profiles WHERE id = auth.uid())
  );

-- Updated_at trigger
CREATE TRIGGER update_curriculum_resources_updated_at
  BEFORE UPDATE ON public.curriculum_resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
