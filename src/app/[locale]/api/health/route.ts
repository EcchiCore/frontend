// app/api/health/route.ts
import { NextResponse } from 'next/server';

type HealthResponse = {
  status: string;
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
};

/**
 * Health Check API
 *
 * ตรวจสอบสถานะการทำงานของ API
 */
export async function GET() {
  // ข้อมูลที่จะส่งกลับ
  const healthData: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };

  // ส่งคืนข้อมูลในรูปแบบ JSON
  return NextResponse.json(healthData);
}