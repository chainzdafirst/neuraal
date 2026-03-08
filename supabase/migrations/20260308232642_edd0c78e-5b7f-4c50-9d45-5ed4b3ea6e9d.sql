
CREATE TABLE public.system_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  banner_type TEXT NOT NULL DEFAULT 'info',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.system_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read active banners"
  ON public.system_banners FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage banners"
  ON public.system_banners FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));
