-- Adicionar coluna de etapa do funil
ALTER TABLE public.quiz_leads 
ADD COLUMN stage TEXT NOT NULL DEFAULT 'lead_capturado';

-- Permitir que admins atualizem leads (para mover no kanban)
CREATE POLICY "Admins can update leads"
  ON public.quiz_leads FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));