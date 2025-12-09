import { Worker, QRCode } from '@/types/worker';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  QrCode,
  Download,
  XCircle,
  User,
  Building2,
  Calendar
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface WorkerCardProps {
  worker: Worker & { qr_codes: QRCode[] };
  onEdit: (worker: Worker) => void;
  onDelete: (id: string) => void;
  onGenerateQR: (id: string) => void;
  onRevokeQR: (qrId: string) => void;
  onDownloadQR: (worker: Worker, qr: QRCode) => void;
}

export function WorkerCard({
  worker,
  onEdit,
  onDelete,
  onGenerateQR,
  onRevokeQR,
  onDownloadQR,
}: WorkerCardProps) {
  const activeQR = worker.qr_codes.find(qr => !qr.is_revoked);
  const fullName = `${worker.first_name} ${worker.last_name}`;

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg border-border/50">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Photo */}
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
            {worker.photo_url ? (
              <img
                src={worker.photo_url}
                alt={fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground truncate">{fullName}</h3>
                <p className="text-sm text-muted-foreground font-mono">{worker.internal_id}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={worker.status} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onEdit(worker)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    {!activeQR ? (
                      <DropdownMenuItem onClick={() => onGenerateQR(worker.id)}>
                        <QrCode className="mr-2 h-4 w-4" />
                        Generar QR
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuItem onClick={() => onDownloadQR(worker, activeQR)}>
                          <Download className="mr-2 h-4 w-4" />
                          Descargar QR
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRevokeQR(activeQR.id)}>
                          <XCircle className="mr-2 h-4 w-4" />
                          Revocar QR
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete(worker.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Dar de baja
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <span className="truncate">{worker.position}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="truncate">{worker.department}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  Vigente: {format(new Date(worker.valid_from), 'dd MMM yyyy', { locale: es })} - {format(new Date(worker.valid_until), 'dd MMM yyyy', { locale: es })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* QR Status Bar */}
        <div className={`flex items-center justify-between px-4 py-2 text-xs ${
          activeQR ? 'bg-success/5 text-success' : 'bg-muted text-muted-foreground'
        }`}>
          <div className="flex items-center gap-2">
            <QrCode className="h-3.5 w-3.5" />
            {activeQR ? (
              <span>QR activo desde {format(new Date(activeQR.created_at), 'dd/MM/yyyy')}</span>
            ) : (
              <span>Sin código QR asignado</span>
            )}
          </div>
          {activeQR && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs"
              onClick={() => onDownloadQR(worker, activeQR)}
            >
              <Download className="mr-1 h-3 w-3" />
              PNG
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
