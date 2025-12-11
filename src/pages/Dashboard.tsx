import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useWorkers } from '@/hooks/useWorkers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, Clock, QrCode, Plus, ArrowRight } from 'lucide-react';
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

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Sistema de Carnets
          </h1>
          <p className="text-muted-foreground mt-1">Gestión de certificaciones de trabajadores</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total
              </CardTitle>
              <div className="p-2 rounded-lg bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-primary">
                {stats.total}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Trabajadores</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-success/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Activos
              </CardTitle>
              <div className="p-2 rounded-lg bg-success/10 transition-transform duration-300 group-hover:scale-110">
                <UserCheck className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-success">
                {stats.active}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Con carnet vigente</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-warning/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Vencidos
              </CardTitle>
              <div className="p-2 rounded-lg bg-warning/10 transition-transform duration-300 group-hover:scale-110">
                <Clock className="h-4 w-4 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-warning">
                {stats.expired}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Requieren renovación</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Con QR
              </CardTitle>
              <div className="p-2 rounded-lg bg-accent/10 transition-transform duration-300 group-hover:scale-110">
                <QrCode className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-accent">
                {stats.withQR}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Códigos generados</p>
            </CardContent>
          </Card>
        </div>

        {/* Alert for expired cards */}
        {stats.expired > 0 && (
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-3 flex-1">
                <Clock className="h-5 w-5 text-warning flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">
                    {stats.expired} carnet{stats.expired !== 1 ? 's' : ''} vencido{stats.expired !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Estos carnets necesitan ser renovados
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild className="flex-shrink-0 w-full sm:w-auto">
                <Link to="/workers?status=VENCIDO">
                  Ver detalles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="border-2 hover:border-primary/20 transition-all duration-300">
          <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-accent/5">
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <Button 
                asChild 
                size="lg"
                className="h-auto flex-col items-start p-4 group"
              >
                <Link to="/workers">
                  <div className="flex items-center gap-2 w-full mb-1">
                    <Users className="h-5 w-5" />
                    <span className="font-semibold">Gestionar Carnets</span>
                  </div>
                  <span className="text-xs text-primary-foreground/80">
                    Ver, crear y editar carnets de trabajadores
                  </span>
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline"
                size="lg" 
                className="h-auto flex-col items-start p-4 group hover:bg-primary/5"
              >
                <Link to="/workers">
                  <div className="flex items-center gap-2 w-full mb-1">
                    <Plus className="h-5 w-5" />
                    <span className="font-semibold">Nuevo Trabajador</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Registrar un nuevo carnet
                  </span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
