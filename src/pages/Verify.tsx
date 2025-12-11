import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Worker } from '@/types/worker';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, XCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Verify() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [status, setStatus] = useState<'valid' | 'invalid' | 'expired' | 'revoked'>('invalid');
  const [expirationDate, setExpirationDate] = useState<string>('');

  useEffect(() => {
    async function verify() {
      if (!token) {
        console.log('❌ No hay token en la URL');
        return;
      }

      console.log('🔍 Verificando token:', token);

      const { data: qrData, error: qrError } = await supabase
        .from('qr_codes')
        .select('*, workers(*)')
        .eq('token', token)
        .maybeSingle();

      console.log('📦 Respuesta de Supabase:', { qrData, qrError });

      setLoading(false);

      if (qrError || !qrData) {
        console.log('❌ Error o no hay datos:', qrError?.message || 'No se encontró el QR');
        setStatus('invalid');
        return;
      }

      if (qrData.is_revoked) {
        console.log('🚫 QR revocado');
        setStatus('revoked');
        return;
      }

      const workerData = qrData.workers as unknown as Worker;
      console.log('👤 Datos del trabajador:', workerData);

      const today = new Date();
      const validUntil = new Date(workerData.valid_until);
      setExpirationDate(workerData.valid_until);

      if (workerData.status !== 'ACTIVO' || workerData.deleted_at) {
        console.log('⚠️ Trabajador no activo o eliminado');
        setStatus('invalid');
      } else if (validUntil < today) {
        console.log('⏰ Carnet vencido');
        setStatus('expired');
      } else {
        console.log('✅ QR válido, redirigiendo...');
        setStatus('valid');
        setWorkerId(workerData.id);
      }
    }

    verify();
  }, [token]);

  // Redirect to worker details if valid
  if (status === 'valid' && workerId) {
    return <Navigate to={`/workers/${workerId}`} replace />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-600 p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-lg">Verificando código QR...</p>
        </div>
      </div>
    );
  }

  // Error states
  if (status === 'invalid' || status === 'revoked') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-400 to-red-600 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {status === 'revoked' ? 'Código QR Revocado' : 'Código QR No Válido'}
            </h2>
            <p className="text-gray-600">
              {status === 'revoked' 
                ? 'Este código QR ha sido revocado y ya no es válido.'
                : 'Este código QR no corresponde a ningún trabajador activo.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-orange-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Carnet Vencido</h2>
            <p className="text-gray-600 mb-4">
              La vigencia de este carnet expiró el{' '}
              {expirationDate ? format(new Date(expirationDate), "dd 'de' MMMM 'de' yyyy", { locale: es }) : 'fecha desconocida'}
            </p>
            <p className="text-sm text-gray-500">
              Por favor, contacte al administrador para renovar el carnet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
