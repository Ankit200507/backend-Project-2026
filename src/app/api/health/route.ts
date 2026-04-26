import { NextResponse } from 'next/server';
import connect from '@/lib/db';

/**
 * Health check endpoint to verify database connection
 * GET /api/health
 */
export async function GET() {
  try {
    const mongoose = await connect();

    return NextResponse.json({
      success: true,
      status: 'healthy',
      database: {
        connected: mongoose.connection.readyState === 1,
        name: mongoose.connection.name,
        host: mongoose.connection.host,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        success: false,
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Database connection failed',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
