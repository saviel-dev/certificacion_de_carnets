-- =====================================================
-- SCHEMA COMPLETO PARA SISTEMA DE CERTIFICACIÓN DE CARNETS
-- Sistema de gestión de credenciales de trabajadores con códigos QR
-- Base de datos: Supabase PostgreSQL
-- Fecha: 2025-12-10
-- =====================================================

-- =====================================================
-- 1. ELIMINACIÓN DE OBJETOS EXISTENTES (OPCIONAL)
-- =====================================================
-- Descomenta estas líneas si necesitas limpiar la base de datos antes de migrar
/*
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.qr_codes CASCADE;
DROP TABLE IF EXISTS public.workers CASCADE;
DROP TYPE IF EXISTS public.worker_status CASCADE;
DROP FUNCTION IF EXISTS public.generate_qr_token() CASCADE;
DROP FUNCTION IF EXISTS public.generate_internal_id() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
*/

-- =====================================================
-- 2. TIPOS PERSONALIZADOS (ENUMS)
-- =====================================================

-- Enum para estados de trabajadores
CREATE TYPE public.worker_status AS ENUM (
  'ACTIVO',    -- Trabajador activo con carnet vigente
  'INACTIVO',  -- Trabajador inactivo temporalmente
  'VENCIDO'    -- Carnet vencido, requiere renovación
);

-- =====================================================
-- 3. TABLAS PRINCIPALES
-- =====================================================

-- Tabla principal de trabajadores
CREATE TABLE public.workers (
  -- Identificación
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  internal_id TEXT NOT NULL UNIQUE,  -- ID secuencial generado automáticamente (ej: 2025-00001)
  
  -- Datos personales
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  cedula TEXT NOT NULL UNIQUE,  -- Cédula de identidad (único por país/región)
  photo_url TEXT,  -- URL de la foto almacenada en Supabase Storage
  
  -- Datos laborales
  position TEXT NOT NULL,  -- Cargo o posición
  department TEXT NOT NULL,  -- Departamento o área
  phone TEXT,  -- Teléfono de contacto
  email TEXT,  -- Email de contacto
  
  -- Estado y vigencia
  status public.worker_status NOT NULL DEFAULT 'ACTIVO',
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,  -- Fecha de inicio de vigencia
  valid_until DATE NOT NULL,  -- Fecha de expiración del carnet
  
  -- Auditoría
  created_by UUID REFERENCES auth.users(id),  -- Usuario que creó el registro
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE,  -- Soft delete
  
  -- Constraints
  CONSTRAINT workers_valid_dates_check CHECK (valid_until >= valid_from),
  CONSTRAINT workers_cedula_format_check CHECK (length(trim(cedula)) >= 5)
);

-- Tabla de códigos QR para verificación
CREATE TABLE public.qr_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  
  -- Token de verificación
  token TEXT NOT NULL UNIQUE,  -- Token único y seguro para el QR (32 caracteres)
  
  -- Control de revocación
  is_revoked BOOLEAN NOT NULL DEFAULT false,  -- Si el código QR ha sido revocado
  revoked_at TIMESTAMP WITH TIME ZONE,  -- Fecha de revocación
  
  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT qr_codes_revoked_check CHECK (
    (is_revoked = false AND revoked_at IS NULL) OR 
    (is_revoked = true AND revoked_at IS NOT NULL)
  )
);

-- Tabla de auditoría para rastrear cambios
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Información de la acción
  action TEXT NOT NULL,  -- INSERT, UPDATE, DELETE, etc.
  table_name TEXT NOT NULL,  -- Tabla afectada
  record_id UUID,  -- ID del registro afectado
  
  -- Datos del cambio
  old_data JSONB,  -- Estado anterior del registro
  new_data JSONB,  -- Nuevo estado del registro
  
  -- Auditoría
  performed_by UUID REFERENCES auth.users(id),  -- Usuario que realizó la acción
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,  -- IP desde donde se realizó la acción
  
  -- Constraints
  CONSTRAINT audit_logs_action_check CHECK (length(trim(action)) > 0)
);

-- =====================================================
-- 4. STORAGE BUCKET PARA FOTOS
-- =====================================================

-- Crear bucket público para fotos de trabajadores
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'worker-photos', 
  'worker-photos', 
  true,
  5242880,  -- 5MB límite por archivo
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. POLÍTICAS DE SEGURIDAD (RLS - Row Level Security)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para WORKERS
-- Usuarios autenticados pueden ver todos los trabajadores
CREATE POLICY "Authenticated users can view workers" 
  ON public.workers 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Usuarios autenticados pueden insertar trabajadores
CREATE POLICY "Authenticated users can insert workers" 
  ON public.workers 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Usuarios autenticados pueden actualizar trabajadores (excepto soft-deleted)
CREATE POLICY "Authenticated users can update workers" 
  ON public.workers 
  FOR UPDATE 
  TO authenticated 
  USING (deleted_at IS NULL)
  WITH CHECK (deleted_at IS NULL);

-- Usuarios autenticados pueden hacer soft-delete
CREATE POLICY "Authenticated users can soft delete workers" 
  ON public.workers 
  FOR UPDATE 
  TO authenticated 
  USING (true);

-- Políticas para QR_CODES
-- Usuarios autenticados pueden gestionar todos los códigos QR
CREATE POLICY "Authenticated users can manage qr_codes" 
  ON public.qr_codes 
  FOR ALL 
  TO authenticated 
  USING (true);

-- Cualquiera (incluso anónimos) puede ver códigos QR no revocados para verificación pública
CREATE POLICY "Anyone can view non-revoked qr_codes for verification" 
  ON public.qr_codes 
  FOR SELECT 
  TO anon 
  USING (is_revoked = false);

-- Políticas para AUDIT_LOGS
-- Solo usuarios autenticados pueden ver logs de auditoría
CREATE POLICY "Authenticated users can view audit logs" 
  ON public.audit_logs 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Solo usuarios autenticados pueden insertar logs
CREATE POLICY "Authenticated users can insert audit logs" 
  ON public.audit_logs 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- =====================================================
-- 6. POLÍTICAS DE STORAGE
-- =====================================================

-- Las fotos son públicamente visibles
CREATE POLICY "Photos are publicly viewable" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'worker-photos');

-- Usuarios autenticados pueden subir fotos
CREATE POLICY "Authenticated users can upload photos" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'worker-photos' AND 
    auth.role() = 'authenticated'
  );

-- Usuarios autenticados pueden actualizar fotos
CREATE POLICY "Authenticated users can update photos" 
  ON storage.objects 
  FOR UPDATE 
  USING (
    bucket_id = 'worker-photos' AND 
    auth.role() = 'authenticated'
  );

-- Usuarios autenticados pueden eliminar fotos
CREATE POLICY "Authenticated users can delete photos" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'worker-photos' AND 
    auth.role() = 'authenticated'
  );

-- =====================================================
-- 7. FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar automáticamente el campo updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para actualizar updated_at en workers
CREATE TRIGGER update_workers_updated_at
  BEFORE UPDATE ON public.workers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Función para generar internal_id único automáticamente
-- Formato: YYYY-NNNNN (ej: 2025-00001, 2025-00002, etc.)
CREATE OR REPLACE FUNCTION public.generate_internal_id()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  new_id TEXT;
BEGIN
  -- Obtener el año actual
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  -- Obtener el siguiente número secuencial para este año
  SELECT COALESCE(MAX(CAST(SUBSTRING(internal_id FROM 6) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM public.workers
  WHERE internal_id LIKE year_part || '-%';
  
  -- Generar el nuevo ID con formato YYYY-NNNNN
  new_id := year_part || '-' || LPAD(sequence_num::TEXT, 5, '0');
  
  NEW.internal_id := new_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para generar internal_id automáticamente al insertar
CREATE TRIGGER generate_worker_internal_id
  BEFORE INSERT ON public.workers
  FOR EACH ROW
  WHEN (NEW.internal_id IS NULL OR NEW.internal_id = '')
  EXECUTE FUNCTION public.generate_internal_id();

-- Función para generar token QR seguro
-- Genera un token alfanumérico de 32 caracteres excluyendo caracteres ambiguos
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

-- Función para actualizar automáticamente el estado del trabajador según fecha
CREATE OR REPLACE FUNCTION public.update_worker_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la fecha de expiración ya pasó, marcar como VENCIDO
  IF NEW.valid_until < CURRENT_DATE THEN
    NEW.status := 'VENCIDO';
  -- Si está dentro del período de vigencia y no está marcado como INACTIVO, marcar como ACTIVO
  ELSIF NEW.valid_until >= CURRENT_DATE AND NEW.valid_from <= CURRENT_DATE AND NEW.status != 'INACTIVO' THEN
    NEW.status := 'ACTIVO';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para actualizar estado automáticamente
CREATE TRIGGER check_worker_status
  BEFORE INSERT OR UPDATE OF valid_until, valid_from ON public.workers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_worker_status();

-- =====================================================
-- 8. ÍNDICES PARA OPTIMIZACIÓN DE CONSULTAS
-- =====================================================

-- Índices en workers
CREATE INDEX IF NOT EXISTS idx_workers_cedula ON public.workers(cedula) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_workers_status ON public.workers(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_workers_department ON public.workers(department) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_workers_valid_until ON public.workers(valid_until) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_workers_internal_id ON public.workers(internal_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_workers_deleted_at ON public.workers(deleted_at);

-- Índices en qr_codes
CREATE INDEX IF NOT EXISTS idx_qr_codes_token ON public.qr_codes(token) WHERE is_revoked = false;
CREATE INDEX IF NOT EXISTS idx_qr_codes_worker_id ON public.qr_codes(worker_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_revoked ON public.qr_codes(is_revoked);

-- Índices en audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON public.audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_at ON public.audit_logs(performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_performed_by ON public.audit_logs(performed_by);

-- =====================================================
-- 9. VISTAS ÚTILES
-- =====================================================

-- Vista para trabajadores activos con sus códigos QR
CREATE OR REPLACE VIEW public.active_workers_with_qr AS
SELECT 
  w.*,
  json_agg(
    json_build_object(
      'id', qr.id,
      'token', qr.token,
      'created_at', qr.created_at,
      'is_revoked', qr.is_revoked
    )
  ) FILTER (WHERE qr.id IS NOT NULL) AS qr_codes
FROM public.workers w
LEFT JOIN public.qr_codes qr ON w.id = qr.worker_id AND qr.is_revoked = false
WHERE w.deleted_at IS NULL
GROUP BY w.id;

-- Vista para trabajadores próximos a vencer (30 días)
CREATE OR REPLACE VIEW public.workers_expiring_soon AS
SELECT 
  *,
  (valid_until - CURRENT_DATE) AS days_until_expiration
FROM public.workers
WHERE 
  deleted_at IS NULL
  AND status = 'ACTIVO'
  AND valid_until BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
ORDER BY valid_until ASC;

-- =====================================================
-- 10. DATOS DE EJEMPLO (OPCIONAL)
-- =====================================================
-- Descomenta para insertar datos de prueba

/*
-- Insertar trabajadores de ejemplo
INSERT INTO public.workers (first_name, last_name, cedula, position, department, phone, email, valid_until)
VALUES 
  ('Juan', 'Pérez', '12345678', 'Supervisor', 'Operaciones', '555-0101', 'juan.perez@empresa.com', CURRENT_DATE + INTERVAL '1 year'),
  ('María', 'González', '87654321', 'Técnico', 'Mantenimiento', '555-0102', 'maria.gonzalez@empresa.com', CURRENT_DATE + INTERVAL '6 months'),
  ('Carlos', 'Rodríguez', '11223344', 'Operario', 'Producción', '555-0103', 'carlos.rodriguez@empresa.com', CURRENT_DATE + INTERVAL '2 years');

-- Generar códigos QR para los trabajadores
INSERT INTO public.qr_codes (worker_id, token)
SELECT 
  id, 
  public.generate_qr_token()
FROM public.workers
WHERE deleted_at IS NULL;
*/

-- =====================================================
-- 11. COMENTARIOS EN TABLAS Y COLUMNAS
-- =====================================================

COMMENT ON TABLE public.workers IS 'Tabla principal de trabajadores con información personal y laboral';
COMMENT ON TABLE public.qr_codes IS 'Códigos QR únicos para verificación de credenciales';
COMMENT ON TABLE public.audit_logs IS 'Registro de auditoría de todas las operaciones importantes';

COMMENT ON COLUMN public.workers.internal_id IS 'ID interno secuencial generado automáticamente (formato: YYYY-NNNNN)';
COMMENT ON COLUMN public.workers.cedula IS 'Cédula de identidad única del trabajador';
COMMENT ON COLUMN public.workers.valid_until IS 'Fecha de expiración del carnet';
COMMENT ON COLUMN public.qr_codes.token IS 'Token único y seguro de 32 caracteres para el código QR';
COMMENT ON COLUMN public.qr_codes.is_revoked IS 'Indica si el código QR ha sido revocado por seguridad';

-- =====================================================
-- FIN DEL SCHEMA
-- =====================================================

-- Para verificar que todo se creó correctamente, ejecuta:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';
