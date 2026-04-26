import { NextResponse } from 'next/server';
import connect from '@/lib/db';
import Property from '@/models/Property';
import User from '@/models/User';

export async function GET() {
  try {
    await connect();

    // Clear existing data
    await Property.deleteMany({});
    await User.deleteMany({});

    // Create users
    const users = await User.create([
      {
        email: 'arjun.mehta@email.com',
        password: 'password123',
        firstName: 'Arjun',
        lastName: 'Mehta',
        phoneNumber: '+91-98765-43210',
        address: '12, Baner Road, Pune',
      },
      {
        email: 'priya.sharma@email.com',
        password: 'password123',
        firstName: 'Priya',
        lastName: 'Sharma',
        phoneNumber: '+91-87654-32109',
        address: '45, Hinjewadi, Pune',
      },
    ]);

    // Create properties
    const properties = await Property.create([
      {
        title: 'Residential Plot in Baner',
        description: 'Residential plot in Baner, Pune with clear title',
        address: '12, Baner Road, Baner, Pune',
        location: {
          type: 'Point',
          coordinates: [73.7903, 18.5596], // [longitude, latitude]
        },
        area: 4500,
        propertyType: 'residential',
        owner: users[0]._id,
        registryNumber: 'TL-MH-2024-001',
        surveyNumber: 'MH-PUNE-001-A',
        status: 'registered',
      },
      {
        title: 'Commercial Plot in Hinjewadi',
        description: 'Commercial plot in Hinjewadi IT Park area',
        address: '45, Hinjewadi Phase 1, Pune',
        location: {
          type: 'Point',
          coordinates: [73.7432, 18.5912], // [longitude, latitude]
        },
        area: 8200,
        propertyType: 'commercial',
        owner: users[0]._id,
        registryNumber: 'TL-MH-2024-002',
        surveyNumber: 'MH-PUNE-002-B',
        status: 'registered',
      },
      {
        title: 'Agricultural Land in Mulshi',
        description: 'Agricultural land suitable for farming',
        address: 'Village Mulshi, Taluka Mulshi, Pune',
        location: {
          type: 'Point',
          coordinates: [73.5432, 18.8123], // [longitude, latitude]
        },
        area: 25000,
        propertyType: 'agricultural',
        owner: users[1]._id,
        registryNumber: 'TL-MH-2024-003',
        surveyNumber: 'MH-MULSHI-001-C',
        status: 'pending',
      },
    ]);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        users: users.length,
        properties: properties.length,
      },
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to seed database',
      },
      { status: 500 }
    );
  }
}
