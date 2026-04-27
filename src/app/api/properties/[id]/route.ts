import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/db';
import { forbiddenResponse, getSessionFromRequest, unauthorizedResponse } from '@/server/auth/guards';
import { deletePropertyRecord, getPropertyByIdOrRegistry, updatePropertyRecord } from '@/server/services/propertyService';
import type { PropertyUpdateInput } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    await connect();
    const property = await getPropertyByIdOrRegistry(id);

    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: property });
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch property' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return unauthorizedResponse();
    if (session.role !== 'admin') return forbiddenResponse();

    const { id } = await params;
    await connect();
    const updates = (await request.json()) as PropertyUpdateInput;
    const property = await updatePropertyRecord(id, updates);

    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found or invalid ID' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: property,
      message: 'Property updated successfully',
    });
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update property' },
      { status: 500 }
    );
  }
}

