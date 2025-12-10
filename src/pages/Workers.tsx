import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useWorkers, useGenerateQR, useRevokeQR, useDeleteWorker, useDepartments } from '@/hooks/useWorkers';
import { WorkerCard } from '@/components/workers/WorkerCard';
import { WorkerForm } from '@/components/workers/WorkerForm';
import { WorkerProfileModal } from '@/components/workers/WorkerProfileModal';
import { Worker, QRCode, WorkerStatus } from '@/types/worker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Users, Loader2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'sonner';

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
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Trabajadores</h1>
            <p className="text-muted-foreground">Gestiona el registro de trabajadores y códigos QR</p>
          </div>
          <Button onClick={() => { setSelectedWorker(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Trabajador
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, cédula o ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as WorkerStatus | 'all')}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ACTIVO">Activo</SelectItem>
              <SelectItem value="INACTIVO">Inactivo</SelectItem>
              <SelectItem value="VENCIDO">Vencido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : workers?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No hay trabajadores</h3>
            <p className="text-muted-foreground">Comienza registrando tu primer trabajador</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {workers?.map((worker) => (
              <div key={worker.id}>
                <WorkerCard
                  worker={worker}
                  onEdit={handleEdit}
                  onDelete={(id) => deleteWorker.mutate(id)}
                  onViewProfile={handleViewProfile}
                />
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
              </div>
            ))}
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
