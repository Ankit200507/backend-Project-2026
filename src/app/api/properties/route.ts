import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/db';
import Property from '@/models/Property';
import User from '@/models/User';
import { Types } from 'mongoose';
import { z } from 'zod';

// Validation schema for creating a property
const createPropertySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  area: z.number().positive('Area must be a positive number'),
  propertyType: z.enum(['residential', 'commercial', 'agricultural', 'industrial']),
  owner: z.string().min(1, 'Owner (ID or Email) is required'),
  registryNumber: z.string().optional(),
  surveyNumber: z.string().optional(),
  documentUrl: z.string().url().optional().or(z.literal('')),
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()]),
  }).optional(),
  longitude: z.number().optional(),
  latitude: z.number().optional(),
  coordinates: z.array(z.number()).length(2).optional(),
});

// GET - Fetch all properties or filter by query
export async function GET(request: NextRequest) {
  try {
    await connect();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const propertyType = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const filter: any = {};
    if (status) filter.status = status;
    if (propertyType) filter.propertyType = propertyType;

    const skip = (page - 1) * limit;

    const properties = await Property.find(filter)
      .populate('owner', 'email firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Property.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: properties,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
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

// POST - Create a new property
export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();

    // Validate request body
    const result = createPropertySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const data = result.data;
    let ownerId = data.owner;

    // If owner is an email, find the user
    if (!Types.ObjectId.isValid(ownerId)) {
      const user = await User.findOne({ email: ownerId });
      if (!user) {
        return NextResponse.json(
          { success: false, error: `User with email '${ownerId}' not found.` },
          { status: 404 }
        );
      }
      ownerId = user._id as string;
    }

    // Determine location coordinates, ensuring we don't default to [0,0] if nothing provided
    let finalCoordinates: [number, number] | null = null;

    if (data.location?.coordinates) {
      finalCoordinates = data.location.coordinates;
    } else if (data.coordinates) {
      finalCoordinates = [data.coordinates[0], data.coordinates[1]];
    } else if (data.longitude !== undefined && data.latitude !== undefined) {
      finalCoordinates = [data.longitude, data.latitude];
    }

    if (!finalCoordinates) {
      return NextResponse.json(
        { success: false, error: 'Location coordinates are required (longitude/latitude or coordinates array)' },
        { status: 400 }
      );
    }

    const property = new Property({
      ...data,
      owner: ownerId,
      location: {
        type: 'Point',
        coordinates: finalCoordinates,
      },
    });

    await property.save();
    await property.populate('owner', 'email firstName lastName');

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

