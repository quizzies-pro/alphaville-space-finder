-- Enum de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Tabela de roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função security definer para checar role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admins podem ver roles
CREATE POLICY "Admins can view roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Atualizar política de leitura de leads para admins
DROP POLICY "No public read" ON public.quiz_leads;

CREATE POLICY "Admins can read leads"
  ON public.quiz_leads FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));