import { cn } from '@/lib/utils';
import { WorkerStatus } from '@/types/worker';

interface StatusBadgeProps {
  status: WorkerStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<WorkerStatus, { label: string; className: string }> = {
  ACTIVO: {
    label: 'Activo',
    className: 'bg-success/10 text-success border-success/20',
  },
  INACTIVO: {
    label: 'Inactivo',
    className: 'bg-muted text-muted-foreground border-muted-foreground/20',
  },
  VENCIDO: {
    label: 'Vencido',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        config.className,
        sizeClasses[size]
      )}
    >
      <span className={cn(
        'mr-1.5 h-1.5 w-1.5 rounded-full',
        status === 'ACTIVO' && 'bg-success',
        status === 'INACTIVO' && 'bg-muted-foreground',
        status === 'VENCIDO' && 'bg-warning'
      )} />
      {config.label}
    </span>
  );
}
