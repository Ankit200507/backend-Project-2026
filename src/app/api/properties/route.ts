import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/db';
import { forbiddenResponse, getSessionFromRequest, unauthorizedResponse } from '@/server/auth/guards';
import { createPropertyRecord, listProperties } from '@/server/services/propertyService';
import type { PropertyCreateInput, PropertyStatus, PropertyType } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return unauthorizedResponse();

    await connect();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as PropertyStatus | null;
    const propertyType = searchParams.get('type') as PropertyType | null;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const result = await listProperties({
      status: status ?? undefined,
      propertyType: propertyType ?? undefined,
      page: Number.isNaN(page) || page < 1 ? 1 : page,
      limit: Number.isNaN(limit) || limit < 1 ? 10 : Math.min(limit, 200),
    });

    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages,
      },
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return unauthorizedResponse();

    await connect();
    const body = (await request.json()) as PropertyCreateInput;

    if (session.role !== 'admin') {
      body.status = 'pending';
    }

    if (
      !body.title ||
      !body.address ||
      !body.area ||
      !body.propertyType ||
      !body.owner?.email ||
      !body.owner?.firstName ||
      !body.owner?.lastName ||
      !body.location?.coordinates
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required fields: title, address, area, propertyType, owner(email, firstName, lastName), location',
        },
        { status: 400 }
      );
    }

    const property = await createPropertyRecord(body);
    return NextResponse.json(
      {
        success: true,
        data: property,
        message: 'Property created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create property' },
      { status: 500 }
    );
  }
}

