import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { AuditLog } from '@/types/worker';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { History, Plus, Edit, Trash2, QrCode, XCircle, Loader2 } from 'lucide-react';

const actionIcons: Record<string, typeof Plus> = {
  CREATE: Plus,
  UPDATE: Edit,
  DELETE: Trash2,
  GENERATE_QR: QrCode,
  REVOKE_QR: XCircle,
};

const actionLabels: Record<string, string> = {
  CREATE: 'Creación',
  UPDATE: 'Actualización',
  DELETE: 'Baja lógica',
  GENERATE_QR: 'Generación QR',
  REVOKE_QR: 'Revocación QR',
};

export default function Audit() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('performed_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as AuditLog[];
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Registro de Auditoría</h1>
          <p className="text-muted-foreground">Historial de acciones en el sistema</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : logs?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <History className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">Sin registros</h3>
          </div>
        ) : (
          <div className="space-y-3">
            {logs?.map((log) => {
              const Icon = actionIcons[log.action] || History;
              return (
                <Card key={log.id}>
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{actionLabels[log.action] || log.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {log.table_name} • {format(new Date(log.performed_at), "dd MMM yyyy, HH:mm", { locale: es })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
