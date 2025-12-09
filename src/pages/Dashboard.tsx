import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useWorkers } from '@/hooks/useWorkers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, QrCode, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { data: workers } = useWorkers();

  const stats = {
    total: workers?.length || 0,
    active: workers?.filter(w => w.status === 'ACTIVO').length || 0,
    inactive: workers?.filter(w => w.status === 'INACTIVO').length || 0,
    expired: workers?.filter(w => w.status === 'VENCIDO').length || 0,
    withQR: workers?.filter(w => w.qr_codes.some(qr => !qr.is_revoked)).length || 0,
  };

  const statCards = [
    { title: 'Total Trabajadores', value: stats.total, icon: Users, color: 'text-primary' },
    { title: 'Activos', value: stats.active, icon: UserCheck, color: 'text-success' },
    { title: 'Inactivos', value: stats.inactive, icon: UserX, color: 'text-muted-foreground' },
    { title: 'Vencidos', value: stats.expired, icon: Clock, color: 'text-warning' },
    { title: 'Con QR Activo', value: stats.withQR, icon: QrCode, color: 'text-accent' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Resumen del sistema de certificación</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button asChild>
              <Link to="/workers">Gestionar Trabajadores</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/audit">Ver Auditoría</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
