import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Worker, WorkerFormData, WorkerStatus } from '@/types/worker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateWorker, useUpdateWorker, useUploadPhoto } from '@/hooks/useWorkers';
import { Loader2, Upload, User } from 'lucide-react';

const workerSchema = z.object({
  first_name: z.string().min(1, 'El nombre es requerido').max(100),
  last_name: z.string().min(1, 'El apellido es requerido').max(100),
  cedula: z.string().min(1, 'La cédula es requerida').max(20),
  position: z.string().min(1, 'El cargo es requerido').max(100),
  department: z.string().min(1, 'El área es requerida').max(100),
  phone: z.string().max(20).optional(),
  email: z.string().email('Email inválido').max(255).optional().or(z.literal('')),
  status: z.enum(['ACTIVO', 'INACTIVO', 'VENCIDO']),
  valid_from: z.string().min(1, 'La fecha de inicio es requerida'),
  valid_until: z.string().min(1, 'La fecha de fin es requerida'),
});

interface WorkerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker?: Worker | null;
}

export function WorkerForm({ open, onOpenChange, worker }: WorkerFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const createWorker = useCreateWorker();
  const updateWorker = useUpdateWorker();
  const uploadPhoto = useUploadPhoto();

  const isEditing = !!worker;
  const isLoading = createWorker.isPending || updateWorker.isPending || uploadPhoto.isPending;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<WorkerFormData>({
    resolver: zodResolver(workerSchema),
    defaultValues: {
      status: 'ACTIVO',
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (worker) {
      reset({
        first_name: worker.first_name,
        last_name: worker.last_name,
        cedula: worker.cedula,
        position: worker.position,
        department: worker.department,
        phone: worker.phone || '',
        email: worker.email || '',
        status: worker.status,
        valid_from: worker.valid_from,
        valid_until: worker.valid_until,
      });
      setPhotoPreview(worker.photo_url);
    } else {
      reset({
        first_name: '',
        last_name: '',
        cedula: '',
        position: '',
        department: '',
        phone: '',
        email: '',
        status: 'ACTIVO',
        valid_from: new Date().toISOString().split('T')[0],
        valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      setPhotoPreview(null);
      setPhotoFile(null);
    }
  }, [worker, reset]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: WorkerFormData) => {
    try {
      let photo_url = worker?.photo_url;

      if (photoFile) {
        photo_url = await uploadPhoto.mutateAsync(photoFile);
      }

      if (isEditing) {
        await updateWorker.mutateAsync({ id: worker.id, ...data, photo_url });
      } else {
        await createWorker.mutateAsync({ ...data, photo_url });
      }

      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const statusValue = watch('status');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? 'Editar Trabajador' : 'Registrar Nuevo Trabajador'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Photo Upload */}
          <div className="flex items-center gap-6">
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
            </div>
            <div>
              <Label
                htmlFor="photo"
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Upload className="h-4 w-4" />
                Subir foto
              </Label>
              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                PNG, JPG hasta 5MB
              </p>
            </div>
          </div>

          {/* Personal Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nombre *</Label>
              <Input
                id="first_name"
                {...register('first_name')}
                placeholder="Ej: Juan"
              />
              {errors.first_name && (
                <p className="text-xs text-destructive">{errors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Apellido *</Label>
              <Input
                id="last_name"
                {...register('last_name')}
                placeholder="Ej: Pérez"
              />
              {errors.last_name && (
                <p className="text-xs text-destructive">{errors.last_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cedula">Cédula *</Label>
              <Input
                id="cedula"
                {...register('cedula')}
                placeholder="Ej: V-12345678"
              />
              {errors.cedula && (
                <p className="text-xs text-destructive">{errors.cedula.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado *</Label>
              <Select
                value={statusValue}
                onValueChange={(value) => setValue('status', value as WorkerStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVO">Activo</SelectItem>
                  <SelectItem value="INACTIVO">Inactivo</SelectItem>
                  <SelectItem value="VENCIDO">Vencido</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-xs text-destructive">{errors.status.message}</p>
              )}
            </div>
          </div>

          {/* Work Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="position">Cargo / Rol *</Label>
              <Input
                id="position"
                {...register('position')}
                placeholder="Ej: Operador de planta"
              />
              {errors.position && (
                <p className="text-xs text-destructive">{errors.position.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Área / Adscripción *</Label>
              <Input
                id="department"
                {...register('department')}
                placeholder="Ej: Producción"
              />
              {errors.department && (
                <p className="text-xs text-destructive">{errors.department.message}</p>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="Ej: 0412-1234567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Ej: juan.perez@empresa.com"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Validity Dates */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="valid_from">Vigencia desde *</Label>
              <Input
                id="valid_from"
                type="date"
                {...register('valid_from')}
              />
              {errors.valid_from && (
                <p className="text-xs text-destructive">{errors.valid_from.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="valid_until">Vigencia hasta *</Label>
              <Input
                id="valid_until"
                type="date"
                {...register('valid_until')}
              />
              {errors.valid_until && (
                <p className="text-xs text-destructive">{errors.valid_until.message}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Guardar cambios' : 'Registrar trabajador'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
