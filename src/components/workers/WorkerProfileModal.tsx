import { Worker, QRCode } from '@/types/worker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { QRCodeSVG } from 'qrcode.react';
import { 
  User, 
  Building2, 
  Calendar, 
  Mail, 
  Phone, 
  IdCard,
  Download,
  QrCode,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface WorkerProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker: (Worker & { qr_codes: QRCode[] }) | null;
  onGenerateQR: (id: string) => void;
  onRevokeQR: (qrId: string) => void;
  onDownloadQR: (worker: Worker, qr: QRCode) => void;
}

export function WorkerProfileModal({
  open,
  onOpenChange,
  worker,
  onGenerateQR,
  onRevokeQR,
  onDownloadQR,
}: WorkerProfileModalProps) {
  if (!worker) return null;

  const activeQR = worker.qr_codes.find(qr => !qr.is_revoked);
  const fullName = `${worker.first_name} ${worker.last_name}`;
  const verificationUrl = activeQR ? `${window.location.origin}/verify/${activeQR.token}` : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Perfil del Trabajador</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header con foto y datos principales */}
          <div className="flex gap-4">
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-muted shadow-md">
              {worker.photo_url ? (
                <img
                  src={worker.photo_url}
                  alt={fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{fullName}</h2>
              <p className="font-mono text-sm text-muted-foreground">{worker.internal_id}</p>
              <div className="mt-2">
                <StatusBadge status={worker.status} />
              </div>
            </div>
          </div>

          {/* Información detallada */}
          <div className="grid gap-3 rounded-xl bg-muted/50 p-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Cargo</p>
                <p className="font-medium">{worker.position}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Departamento</p>
                <p className="font-medium">{worker.department}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <IdCard className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Cédula</p>
                <p className="font-medium">{worker.cedula}</p>
              </div>
            </div>
            {worker.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Correo</p>
                  <p className="font-medium">{worker.email}</p>
                </div>
              </div>
            )}
            {worker.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{worker.phone}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Vigencia</p>
                <p className="font-medium">
                  {format(new Date(worker.valid_from), "dd 'de' MMMM yyyy", { locale: es })} - {format(new Date(worker.valid_until), "dd 'de' MMMM yyyy", { locale: es })}
                </p>
              </div>
            </div>
          </div>

          {/* Sección del código QR */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Código QR de Verificación</h3>
            </div>

            {activeQR ? (
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-xl bg-white p-4 shadow-md">
                  <QRCodeSVG
                    value={verificationUrl}
                    size={180}
                    level="H"
                    fgColor="hsl(152, 69%, 35%)"
                    bgColor="#ffffff"
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Generado el {format(new Date(activeQR.created_at), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => onDownloadQR(worker, activeQR)}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Descargar PNG
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => onRevokeQR(activeQR.id)}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <XCircle className="h-4 w-4" />
                    Revocar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="rounded-full bg-muted p-4">
                  <QrCode className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-center text-muted-foreground">
                  Este trabajador no tiene un código QR activo
                </p>
                <Button onClick={() => onGenerateQR(worker.id)} className="gap-2">
                  <QrCode className="h-4 w-4" />
                  Generar Código QR
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
