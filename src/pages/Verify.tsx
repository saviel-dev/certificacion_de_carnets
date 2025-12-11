import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Worker } from '@/types/worker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, XCircle, AlertTriangle, User, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Verify() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [status, setStatus] = useState<'valid' | 'invalid' | 'expired' | 'revoked'>('invalid');

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
      setWorker(workerData);

      const today = new Date();
      const validUntil = new Date(workerData.valid_until);

      if (workerData.status !== 'ACTIVO' || workerData.deleted_at) {
        console.log('⚠️ Trabajador no activo o eliminado');
        setStatus('invalid');
      } else if (validUntil < today) {
        console.log('⏰ Carnet vencido');
        setStatus('expired');
      } else {
        console.log('✅ QR válido, mostrando carnet');
        setStatus('valid');
      }
    }

    verify();
  }, [token]);

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

  if (status === 'expired' && worker) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-orange-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Carnet Vencido</h2>
            <p className="text-gray-600 mb-4">
              La vigencia de este carnet expiró el{' '}
              {format(new Date(worker.valid_until), "dd 'de' MMMM 'de' yyyy", { locale: es })}
            </p>
            <p className="text-sm text-gray-500">
              Por favor, contacte al administrador para renovar el carnet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Valid worker - Show the green card
  if (!worker) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Digital Carnet */}
        <div className="bg-emerald-500 rounded-3xl shadow-2xl overflow-hidden relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24" />
          </div>

          {/* Logo/Shield Icon - Top Right */}
          <div className="absolute top-6 right-6 z-10">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
              <Shield className="h-8 w-8 text-white" strokeWidth={2.5} />
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 p-8 pt-12">
            {/* Photo */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-white p-1.5 shadow-xl">
                  {worker.photo_url ? (
                    <img 
                      src={worker.photo_url} 
                      alt={`${worker.first_name} ${worker.last_name}`}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                {/* Status indicator */}
                <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-400 border-4 border-emerald-500 rounded-full" />
              </div>
            </div>

            {/* Name and ID */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white mb-1">
                {worker.first_name} {worker.last_name}
              </h1>
              <p className="text-emerald-100 text-sm font-medium">
                ID: {worker.internal_id}
              </p>
            </div>

            {/* Information Card */}
            <Card className="shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-center text-gray-700 text-base">
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {/* Row 1: Cargo y Departamento */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 font-medium mb-1">Cargo:</p>
                    <p className="text-emerald-600 font-semibold">{worker.position}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium mb-1">Departamento:</p>
                    <p className="text-emerald-600 font-semibold">{worker.department}</p>
                  </div>
                </div>

                {/* Row 2: Cédula y Teléfono */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 font-medium mb-1">Cédula:</p>
                    <p className="text-gray-800">{worker.cedula}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium mb-1">Teléfono:</p>
                    <p className="text-gray-800">{worker.phone || 'No especificado'}</p>
                  </div>
                </div>

                {/* Row 3: Email y Estado */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-gray-600 font-medium mb-1">Correo electrónico:</p>
                    <p className="text-blue-600 text-xs break-all">{worker.email || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium mb-1">Estado:</p>
                    <p className="text-green-600 font-bold text-lg">{worker.status}</p>
                  </div>
                </div>

                {/* Validity */}
                <div className="pt-3 border-t border-gray-200 text-center">
                  <p className="text-gray-500 text-xs">
                    Válido hasta el {format(new Date(worker.valid_until), "dd/MM/yyyy", { locale: es })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-white/80 text-xs">
            Verificación realizada el {format(new Date(), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
          </p>
        </div>
      </div>
    </div>
  );
}
