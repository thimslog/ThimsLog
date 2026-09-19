export interface AdminSummary {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  role: string;
}

export interface AdminAuditLogRecord {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  entityLabel?: string | null;
  description: string;
  metadata?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  admin?: AdminSummary | null;
}

export interface AuditMetrics {
  totalLogs: number;
  todayLogs: number;
  activeAdminsCount: number;
}

export interface AuditPaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AuditLogsResponse {
  success: boolean;
  data: {
    logs: AdminAuditLogRecord[];
    pagination: AuditPaginationData;
    metrics: AuditMetrics;
    filterOptions: {
      admins: string[];
    };
  };
}
