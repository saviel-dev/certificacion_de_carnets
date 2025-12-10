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
  XCircle,
  Briefcase,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  if (!worker) return null;

  const activeQR = worker.qr_codes.find(qr => !qr.is_revoked);
  const fullName = `${worker.first_name} ${worker.last_name}`;
  const verificationUrl = activeQR ? `${window.location.origin}/verify/${activeQR.token}` : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-background">
        <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
          
          {/* Left Column: Fixed Sidebar-style Info */}
          <div className="w-full md:w-1/3 bg-muted/30 p-6 flex flex-col items-center border-b md:border-b-0 md:border-r border-border/50">
            <div className="relative mb-4 group">
              <div className="h-32 w-32 rounded-2xl overflow-hidden shadow-lg border-2 border-background ring-2 ring-border/20 transition-transform duration-300 group-hover:scale-105">
                {worker.photo_url ? (
                  <img
                    src={worker.photo_url}
                    alt={fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <User className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-background p-1 rounded-full shadow-sm">
                <StatusBadge status={worker.status} />
              </div>
            </div>

            <div className="text-center space-y-1 mb-6">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">{fullName}</h2>
              <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                {worker.internal_id}
              </p>
            </div>

            <div className="w-full space-y-2 mt-auto">
              <Button 
                className="w-full transition-all hover:translate-y-[-1px]" 
                variant="default"
                onClick={() => navigate(`/workers/${worker.id}`)}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver Perfil Completo
              </Button>
            </div>
          </div>

          {/* Right Column: Scrollable Details */}
          <div className="flex-1 p-6 overflow-y-auto">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <span>Información Profesional</span>
              </DialogTitle>
              <p className="text-sm text-muted-foreground">Detalles del contrato y contacto del trabajador.</p>
            </DialogHeader>

            <div className="grid gap-6">
              {/* Professional Details Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> Cargo
                  </span>
                  <p className="text-sm font-medium text-foreground p-2 rounded-md bg-muted/40 border border-border/40">
                    {worker.position}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> Departamento
                  </span>
                  <p className="text-sm font-medium text-foreground p-2 rounded-md bg-muted/40 border border-border/40">
                    {worker.department}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <IdCard className="h-3.5 w-3.5" /> Cédula
                  </span>
                  <p className="text-sm font-medium text-foreground p-2 rounded-md bg-muted/40 border border-border/40">
                    {worker.cedula}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Vigencia
                  </span>
                  <p className="text-sm font-medium text-foreground p-2 rounded-md bg-muted/40 border border-border/40">
                    {format(new Date(worker.valid_until), "dd/MM/yyyy", { locale: es })}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              {(worker.email || worker.phone) && (
                <div className="space-y-3">
                  <div className="h-px bg-border/50" />
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Contacto
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {worker.email && (
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs text-muted-foreground">Correo Electrónico</p>
                          <p className="text-sm font-medium truncate" title={worker.email}>{worker.email}</p>
                        </div>
                      </div>
                    )}
                    {worker.phone && (
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          <Phone className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Teléfono</p>
                          <p className="text-sm font-medium">{worker.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* QR Section */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mt-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
                      <QrCode className="h-4 w-4" />
                      Credencial Digital
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                      {activeQR 
                        ? "Este código QR permite verificar la identidad del trabajador en tiempo real."
                        : "Genere un código QR para habilitar la credencial digital."
                      }
                    </p>
                  </div>
                  
                  {activeQR ? (
                    <div className="flex flex-col items-end gap-2">
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <QRCodeSVG
                          value={verificationUrl}
                          size={80}
                          level="M"
                          fgColor="hsl(var(--primary))"
                          bgColor="#ffffff"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => onDownloadQR(worker, activeQR)}
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          title="Descargar QR"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          onClick={() => onRevokeQR(activeQR.id)}
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Revocar Credencial"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => onGenerateQR(worker.id)} 
                      size="sm"
                      className="shadow-md"
                    >
                      <QrCode className="mr-2 h-4 w-4" />
                      Generar QR
                    </Button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
