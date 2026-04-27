import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error:
        'Seeding is disabled in this build. Use the bootstrap admin script and create data via authenticated APIs/UI.',
    },
    { status: 410 }
  );
}

