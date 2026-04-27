import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Hello from Next.js API!' }, { status: 200 });
}

export async function POST(request: Request) {
  const data = await request.json();
  // Process the data (e.g., save to a database)
  return NextResponse.json({ message: 'Data received', data }, { status: 201 });
}
