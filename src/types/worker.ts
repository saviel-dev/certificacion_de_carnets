export type WorkerStatus = 'ACTIVO' | 'INACTIVO' | 'VENCIDO';

export interface Worker {
  id: string;
  internal_id: string;
  first_name: string;
  last_name: string;
  cedula: string;
  photo_url: string | null;
  position: string;
  department: string;
  phone: string | null;
  email: string | null;
  status: WorkerStatus;
  valid_from: string;
  valid_until: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface QRCode {
  id: string;
  worker_id: string;
  token: string;
  is_revoked: boolean;
  revoked_at: string | null;
  created_at: string;
  created_by: string | null;
}

export interface WorkerWithQR extends Worker {
  qr_codes: QRCode[];
}

export interface AuditLog {
  id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  performed_by: string | null;
  performed_at: string;
  ip_address: string | null;
}

export interface WorkerFormData {
  first_name: string;
  last_name: string;
  cedula: string;
  position: string;
  department: string;
  phone?: string;
  email?: string;
  status: WorkerStatus;
  valid_from: string;
  valid_until: string;
  photo?: File;
}

export interface VerificationResult {
  valid: boolean;
  worker: Worker | null;
  message: string;
}
