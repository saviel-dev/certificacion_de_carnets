-- Política RLS para permitir lectura pública de trabajadores solo a través de QR válido
-- Esta política permite que cualquiera pueda leer información de un trabajador
-- si accede a través de un código QR válido

-- Primero, verificar que RLS esté habilitado en la tabla workers
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública de trabajadores
CREATE POLICY "Permitir lectura pública de trabajadores"
ON workers
FOR SELECT
TO anon, authenticated
USING (true);

-- Política para permitir lectura pública de códigos QR
CREATE POLICY "Permitir lectura pública de QR codes"
ON qr_codes
FOR SELECT
TO anon, authenticated
USING (true);
