import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Worker, WorkerStatus } from '@/types/worker';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertTriangle, User, Building2, Calendar, Shield, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Verify() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [status, setStatus] = useState<'valid' | 'invalid' | 'expired' | 'revoked'>('invalid');

  useEffect(() => {
    async function verify() {
      if (!token) return;

      const { data: qrData, error: qrError } = await supabase
        .from('qr_codes')
        .select('*, workers(*)')
        .eq('token', token)
        .maybeSingle();

      setLoading(false);

      if (qrError || !qrData) {
        setStatus('invalid');
        return;
      }

      if (qrData.is_revoked) {
        setStatus('revoked');
        return;
      }

      const workerData = qrData.workers as unknown as Worker;
      setWorker(workerData);

      const today = new Date();
      const validUntil = new Date(workerData.valid_until);

      if (workerData.status !== 'ACTIVO' || workerData.deleted_at) {
        setStatus('invalid');
      } else if (validUntil < today) {
        setStatus('expired');
      } else {
        setStatus('valid');
      }
    }

    verify();
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statusConfig = {
    valid: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', title: 'Registro Válido', desc: 'Este trabajador está activo y su información es verificable.' },
    invalid: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', title: 'Registro No Válido', desc: 'Este código QR no corresponde a un trabajador activo.' },
    expired: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', title: 'Registro Vencido', desc: 'La vigencia de este trabajador ha expirado.' },
    revoked: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', title: 'QR Revocado', desc: 'Este código QR ha sido revocado y ya no es válido.' },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="mx-auto max-w-md pt-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-bold">CertiCarnet</h1>
          <p className="text-sm text-muted-foreground">Verificación de Trabajador</p>
        </div>

        <Card className={`border-2 ${status === 'valid' ? 'border-success/30' : status === 'expired' ? 'border-warning/30' : 'border-destructive/30'}`}>
          <CardContent className="p-6">
            <div className={`mb-6 flex flex-col items-center rounded-xl ${config.bg} p-6`}>
              <Icon className={`h-12 w-12 ${config.color}`} />
              <h2 className={`mt-3 text-xl font-bold ${config.color}`}>{config.title}</h2>
              <p className="mt-1 text-center text-sm text-muted-foreground">{config.desc}</p>
            </div>

            {worker && status !== 'revoked' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                    {worker.photo_url ? (
                      <img src={worker.photo_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{worker.first_name} {worker.last_name}</h3>
                    <p className="text-sm text-muted-foreground font-mono">{worker.internal_id}</p>
                    <StatusBadge status={worker.status} size="sm" />
                  </div>
                </div>

                <div className="space-y-2 rounded-lg bg-muted/50 p-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{worker.position}</span>
                    <span className="text-muted-foreground">• {worker.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Vigente hasta: {format(new Date(worker.valid_until), 'dd MMMM yyyy', { locale: es })}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Verificación realizada el {format(new Date(), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
        </p>
      </div>
    </div>
  );
}
