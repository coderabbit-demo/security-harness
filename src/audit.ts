export interface AuditEntry {
  bookingId: number;
  actor: string;
  timestamp: string;
}

const auditLog: AuditEntry[] = [];

export function recordCancellation(bookingId: number, actor: string): void {
  auditLog.push({ bookingId, actor, timestamp: new Date().toISOString() });
}

export function getAuditLog(): AuditEntry[] {
  return auditLog;
}
