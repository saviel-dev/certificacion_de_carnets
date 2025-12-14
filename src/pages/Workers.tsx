import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useWorkers, useGenerateQR, useRevokeQR, useDeleteWorker, useDepartments } from '@/hooks/useWorkers';
import { WorkerForm } from '@/components/workers/WorkerForm';
import { WorkerProfileModal } from '@/components/workers/WorkerProfileModal';
import { Worker, QRCode, WorkerStatus } from '@/types/worker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Plus, Search, Users, Loader2, HelpCircle, User, QrCode, Eye, Edit, Trash2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'sonner';
import { useWorkerTour } from '@/hooks/useWorkerTour';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Workers() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkerStatus | 'all'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [profileWorkerId, setProfileWorkerId] = useState<string | null>(null);

  const { data: workers, isLoading } = useWorkers({ search, status: statusFilter });
  const { data: departments } = useDepartments();
  const generateQR = useGenerateQR();
  const revokeQR = useRevokeQR();
  const deleteWorker = useDeleteWorker();
  const { startTour } = useWorkerTour();

  // Get the current profile worker from the workers list (always fresh data)
  const profileWorker = profileWorkerId 
    ? workers?.find(w => w.id === profileWorkerId) || null 
    : null;

  const handleEdit = (worker: Worker) => {
    setSelectedWorker(worker);
    setFormOpen(true);
  };

  const handleViewProfile = (worker: Worker & { qr_codes: QRCode[] }) => {
    setProfileWorkerId(worker.id);
    setProfileOpen(true);
  };

  const handleGenerateQR = async (workerId: string) => {
    const worker = workers?.find(w => w.id === workerId);
    const hasActiveQR = worker?.qr_codes.some(qr => !qr.is_revoked);
    
    if (hasActiveQR) {
      toast.error('Este trabajador ya tiene un código QR activo');
      return;
    }
    
    generateQR.mutate(workerId);
  };

  const handleDownloadQR = (worker: Worker, qr: QRCode) => {
    const verificationUrl = `${window.location.origin}/verify/${qr.token}`;
    const canvas = document.createElement('canvas');
    const size = 400;
    canvas.width = size + 80;
    canvas.height = size + 120;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const tempCanvas = document.getElementById(`qr-temp-${qr.token}`) as HTMLCanvasElement;
    if (tempCanvas) {
      ctx.drawImage(tempCanvas, 40, 40, size, size);
    }

    ctx.fillStyle = '#1a6b47';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${worker.first_name} ${worker.last_name}`, canvas.width / 2, size + 70);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(worker.internal_id, canvas.width / 2, size + 95);

    const link = document.createElement('a');
    link.download = `QR_${worker.internal_id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Trabajadores
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Gestiona el registro de trabajadores y códigos QR
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline"
              onClick={startTour}
              className="flex-1 sm:flex-none shadow-md hover:shadow-lg transition-all duration-300"
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Cómo usar
            </Button>
            <Button 
              id="new-worker-btn"
              onClick={() => { setSelectedWorker(null); setFormOpen(true); }}
              className="flex-1 sm:flex-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Trabajador
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-2 hover:border-primary/20 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Buscar por nombre, cédula o ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-11 border-2 focus:border-primary transition-colors"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as WorkerStatus | 'all')}>
                <SelectTrigger className="w-full sm:w-48 h-11 border-2 focus:border-primary transition-colors">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="ACTIVO">Activos</SelectItem>
                  <SelectItem value="INACTIVO">Inactivos</SelectItem>
                  <SelectItem value="VENCIDO">Vencidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(search || statusFilter !== 'all') && (
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <span>Mostrando {workers?.length || 0} resultado(s)</span>
                {(search || statusFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearch('');
                      setStatusFilter('all');
                    }}
                    className="h-7 text-xs"
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-sm">Cargando trabajadores...</p>
          </div>
        ) : workers?.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                <Users className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No hay trabajadores</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                {search || statusFilter !== 'all' 
                  ? 'No se encontraron trabajadores con los filtros aplicados'
                  : 'Comienza registrando tu primer trabajador'}
              </p>
              {!search && statusFilter === 'all' && (
                <Button onClick={() => { setSelectedWorker(null); setFormOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Trabajador
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white border border-gray-200 rounded overflow-hidden animate-slide-up">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Trabajador</th>
                    <th className="px-6 py-4">Cargo</th>
                    <th className="px-6 py-4">Departamento</th>
                    <th className="px-6 py-4">Válido Hasta</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-center">QR</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {workers?.map((worker, index) => {
                    const activeQR = worker.qr_codes.find(qr => !qr.is_revoked);
                    const fullName = `${worker.first_name} ${worker.last_name}`;
                    
                    return (
                      <tr 
                        key={worker.id} 
                        className="hover:bg-gray-50 transition-colors animate-scale-in"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        {/* Trabajador (foto + nombre + ID) */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
                              {worker.photo_url ? (
                                <img
                                  src={worker.photo_url}
                                  alt={fullName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-green-100">
                                  <User className="h-5 w-5 text-green-600" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-gray-800 truncate">{fullName}</div>
                              <div className="text-xs text-gray-500 font-mono">{worker.internal_id}</div>
                            </div>
                          </div>
                        </td>

                        {/* Cargo */}
                        <td className="px-6 py-4 text-gray-800">{worker.position}</td>

                        {/* Departamento */}
                        <td className="px-6 py-4 text-gray-600">{worker.department}</td>

                        {/* Válido Hasta */}
                        <td className="px-6 py-4 text-gray-600">
                          {format(new Date(worker.valid_until), "dd MMM yyyy", { locale: es })}
                        </td>

                        {/* Estado */}
                        <td className="px-6 py-4">
                          <StatusBadge status={worker.status} />
                        </td>

                        {/* QR */}
                        <td className="px-6 py-4 text-center">
                          {activeQR ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                              <QrCode className="h-3.5 w-3.5" />
                              Activo
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
                              <QrCode className="h-3.5 w-3.5" />
                              Sin QR
                            </div>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewProfile(worker)}
                              className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(worker)}
                              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteWorker.mutate(worker.id)}
                              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>

                        {/* QR codes ocultos para descarga */}
                        {worker.qr_codes.filter(qr => !qr.is_revoked).map(qr => (
                          <QRCodeCanvas
                            key={qr.id}
                            id={`qr-temp-${qr.token}`}
                            value={`${window.location.origin}/verify/${qr.token}`}
                            size={400}
                            style={{ display: 'none' }}
                            fgColor="#1a6b47"
                          />
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <WorkerForm open={formOpen} onOpenChange={setFormOpen} worker={selectedWorker} />
      
      <WorkerProfileModal
        open={profileOpen}
        onOpenChange={setProfileOpen}
        worker={profileWorker}
        onGenerateQR={handleGenerateQR}
        onRevokeQR={(id) => revokeQR.mutate(id)}
        onDownloadQR={handleDownloadQR}
      />
    </DashboardLayout>
  );
}
