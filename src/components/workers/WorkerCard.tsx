import { Worker, QRCode } from '@/types/worker';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { 
  Edit, 
  Trash2, 
  QrCode,
  User,
  Building2,
  Calendar,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface WorkerCardProps {
  worker: Worker & { qr_codes: QRCode[] };
  onEdit: (worker: Worker) => void;
  onDelete: (id: string) => void;
  onViewProfile: (worker: Worker & { qr_codes: QRCode[] }) => void;
}

export function WorkerCard({
  worker,
  onEdit,
  onDelete,
  onViewProfile,
}: WorkerCardProps) {
  const activeQR = worker.qr_codes.find(qr => !qr.is_revoked);
  const fullName = `${worker.first_name} ${worker.last_name}`;

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 border-border/50 hover:border-primary/20">
      <CardContent className="p-0">
        {/* Header con foto y nombre */}
        <div className="relative">
          <div className="absolute inset-0 gradient-primary opacity-90" />
          <div className="relative flex items-center gap-4 p-4">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-white/20 ring-2 ring-white/30 shadow-lg">
              {worker.photo_url ? (
                <img
                  src={worker.photo_url}
                  alt={fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/10">
                  <User className="h-8 w-8 text-white/80" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 text-white">
              <h3 className="font-bold text-lg truncate">{fullName}</h3>
              <p className="text-sm text-white/70 font-mono">{worker.internal_id}</p>
            </div>
            <StatusBadge status={worker.status} />
          </div>
        </div>

        {/* Información del trabajador */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="font-medium">{worker.position}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground truncate">{worker.department}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>
              Vigente hasta {format(new Date(worker.valid_until), "dd MMM yyyy", { locale: es })}
            </span>
          </div>

          {/* Estado del QR */}
          <div className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 ${
            activeQR 
              ? 'bg-success/10 text-success' 
              : 'bg-muted text-muted-foreground'
          }`}>
            <QrCode className="h-3.5 w-3.5" />
            {activeQR ? (
              <span>QR activo desde {format(new Date(activeQR.created_at), 'dd/MM/yyyy')}</span>
            ) : (
              <span>Sin código QR asignado</span>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex border-t border-border">
          <Button 
            variant="ghost" 
            className="flex-1 rounded-none h-11 text-sm gap-2 hover:bg-primary/5 hover:text-primary"
            onClick={() => onViewProfile(worker)}
          >
            <Eye className="h-4 w-4" />
            Ver Perfil
          </Button>
          <div className="w-px bg-border" />
          <Button 
            variant="ghost" 
            className="flex-1 rounded-none h-11 text-sm gap-2 hover:bg-primary/5 hover:text-primary"
            onClick={() => onEdit(worker)}
          >
            <Edit className="h-4 w-4" />
            Editar
          </Button>
          <div className="w-px bg-border" />
          <Button 
            variant="ghost" 
            className="flex-1 rounded-none h-11 text-sm gap-2 hover:bg-destructive/5 hover:text-destructive"
            onClick={() => onDelete(worker.id)}
          >
            <Trash2 className="h-4 w-4" />
            Baja
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
