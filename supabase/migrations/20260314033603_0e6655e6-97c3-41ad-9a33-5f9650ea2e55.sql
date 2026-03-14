-- Tabela para salvar leads do quiz
CREATE TABLE public.quiz_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_name TEXT NOT NULL,
  lead_email TEXT NOT NULL,
  lead_whatsapp TEXT NOT NULL,
  company_profile TEXT,
  relocation_moment TEXT,
  investment_match TEXT,
  custom_message TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.quiz_leads ENABLE ROW LEVEL SECURITY;

-- Permitir inserção pública (leads não autenticados)
CREATE POLICY "Anyone can insert leads"
  ON public.quiz_leads FOR INSERT
  WITH CHECK (true);

-- Negar leitura pública (apenas admin via dashboard)
CREATE POLICY "No public read"
  ON public.quiz_leads FOR SELECT
  USING (false);