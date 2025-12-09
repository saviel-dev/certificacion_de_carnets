-- Enum para estados de trabajadores
CREATE TYPE public.worker_status AS ENUM ('ACTIVO', 'INACTIVO', 'VENCIDO');

-- Tabla principal de trabajadores
CREATE TABLE public.workers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  internal_id TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  cedula TEXT NOT NULL UNIQUE,
  photo_url TEXT,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  status public.worker_status NOT NULL DEFAULT 'ACTIVO',
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de códigos QR
CREATE TABLE public.qr_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  is_revoked BOOLEAN NOT NULL DEFAULT false,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabla de auditoría
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT
);

-- Storage bucket para fotos
INSERT INTO storage.buckets (id, name, public) VALUES ('worker-photos', 'worker-photos', true);

-- Policies para storage
CREATE POLICY "Photos are publicly viewable" ON storage.objects FOR SELECT USING (bucket_id = 'worker-photos');
CREATE POLICY "Authenticated users can upload photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'worker-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update photos" ON storage.objects FOR UPDATE USING (bucket_id = 'worker-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete photos" ON storage.objects FOR DELETE USING (bucket_id = 'worker-photos' AND auth.role() = 'authenticated');

-- Enable RLS
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies para workers (solo usuarios autenticados pueden gestionar)
CREATE POLICY "Authenticated users can view workers" ON public.workers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert workers" ON public.workers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update workers" ON public.workers FOR UPDATE TO authenticated USING (true);

-- RLS Policies para qr_codes
CREATE POLICY "Authenticated users can manage qr_codes" ON public.qr_codes FOR ALL TO authenticated USING (true);
CREATE POLICY "Anyone can view non-revoked qr_codes for verification" ON public.qr_codes FOR SELECT TO anon USING (is_revoked = false);

-- RLS Policies para audit_logs
CREATE POLICY "Authenticated users can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Function para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para updated_at
CREATE TRIGGER update_workers_updated_at
  BEFORE UPDATE ON public.workers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function para generar internal_id único
CREATE OR REPLACE FUNCTION public.generate_internal_id()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  new_id TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(internal_id FROM 6) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM public.workers
  WHERE internal_id LIKE year_part || '-%';
  new_id := year_part || '-' || LPAD(sequence_num::TEXT, 5, '0');
  NEW.internal_id := new_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para generar internal_id automáticamente
CREATE TRIGGER generate_worker_internal_id
  BEFORE INSERT ON public.workers
  FOR EACH ROW
  WHEN (NEW.internal_id IS NULL OR NEW.internal_id = '')
  EXECUTE FUNCTION public.generate_internal_id();

-- Function para generar token QR seguro
CREATE OR REPLACE FUNCTION public.generate_qr_token()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..32 LOOP
    result := result || SUBSTR(chars, FLOOR(RANDOM() * LENGTH(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Index para búsquedas
CREATE INDEX idx_workers_cedula ON public.workers(cedula);
CREATE INDEX idx_workers_status ON public.workers(status);
CREATE INDEX idx_workers_department ON public.workers(department);
CREATE INDEX idx_qr_codes_token ON public.qr_codes(token);
CREATE INDEX idx_qr_codes_worker_id ON public.qr_codes(worker_id);