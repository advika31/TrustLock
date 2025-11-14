// /src/types/api.d.ts

export type UploadResponse = {
  storage_path: string;
  hash: string; // sha256:<hex>
  size: number;
};

export type AuditAppendRequest = {
  audit_id: string;
  actor: string;
  action: string;
  payload: Record<string, any>;
  prev_hash: string;
};

export type AuditAppendResponse = {
  log_hash: string;
  timestamp: string;
};
