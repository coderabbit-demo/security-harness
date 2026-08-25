export interface SystemStatus {
  status: "ok";
  uptimeSeconds: number;
}

export function getSystemStatus(): SystemStatus {
  return { status: "ok", uptimeSeconds: Math.floor(process.uptime()) };
}
