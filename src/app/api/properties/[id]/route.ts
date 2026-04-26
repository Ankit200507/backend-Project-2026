import { NextRequest, NextResponse } from 'next/server';
import connect from '@/lib/db';
import Property from '@/models/Property';
import { Types } from 'mongoose';
import { z } from 'zod';

// Validation schema for updating a property
const updatePropertySchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  address: z.string().min(5).optional(),
  area: z.number().positive().optional(),
  propertyType: z.enum(['residential', 'commercial', 'agricultural', 'industrial']).optional(),
  status: z.enum(['pending', 'registered', 'disputed']).optional(),
  registryNumber: z.string().optional(),
  surveyNumber: z.string().optional(),
  documentUrl: z.string().url().optional().or(z.literal('')),
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()]),
  }).optional(),
});

// GET - Fetch single property by ID or registryNumber
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connect();

    let property = null;

    // 1. Try finding by MongoDB ObjectId
    if (Types.ObjectId.isValid(id)) {
      property = await Property.findById(id)
        .populate('owner', 'email firstName lastName aadharNumber');
    }

    // 2. Fallback: Try registryNumber or surveyNumber lookup
    if (!property) {
      property = await Property.findOne({
        $or: [
          { registryNumber: id },
          { surveyNumber: id }
        ]
      }).populate('owner', 'email firstName lastName aadharNumber');
    }

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch property' },
      { status: 500 }
    );
  }
}

// PUT - Update property
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connect();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid property ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = updatePropertySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const property = await Property.findByIdAndUpdate(id, result.data, {
      new: true,
      runValidators: true,
    }).populate('owner', 'email firstName lastName');

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
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

// DELETE - Delete property
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connect();

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid property ID' },
        { status: 400 }
      );
    }

    const property = await Property.findByIdAndDelete(id);

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete property' },
      { status: 500 }
    );
  }
}

