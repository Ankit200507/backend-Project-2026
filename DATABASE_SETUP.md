# MongoDB Database Setup Guide

## Setup Instructions

### 1. Install Dependencies
Already done! Mongoose has been installed.

### 2. Configure MongoDB Connection

#### Option A: MongoDB Atlas (Cloud - Recommended for Development)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create an account and sign up for free tier
3. Create a cluster
4. Get your connection string from "Connect" button
5. Update `.env.local`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/terraledger?retryWrites=true&w=majority
```

#### Option B: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Update `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/terraledger
```

### 3. Database Models

Three main models are set up:

#### User Model (`/models/User.ts`)
- Stores user account information
- Email validation and unique constraint
- Profile data (name, phone, address, image)

#### Property Model (`/models/Property.ts`)
- Stores property information
- Geospatial indexing for map queries
- Types: residential, commercial, agricultural, industrial
- Status tracking: pending, registered, disputed
- Location stored as GeoJSON Point

#### LandRegistry Model (`/models/LandRegistry.ts`)
- Official land registration records
- Links to Property
- Tracks ownership history
- Encumbrances (mortgages, liens)
- Registry certificate storage

## API Routes

### Properties API Endpoints

#### List Properties
```bash
GET /api/properties
GET /api/properties?status=registered
GET /api/properties?type=residential
```

#### Create Property
```bash
POST /api/properties
Content-Type: application/json

{
  "title": "Riverside Property",
  "description": "Beautiful riverside land",
  "address": "123 Main St, City",
  "longitude": 40.7128,
  "latitude": -74.0060,
  "area": 5000,
  "propertyType": "residential",
  "owner": "user_id_here"
}
```

#### Get Single Property
```bash
GET /api/properties/[id]
```

#### Update Property
```bash
PUT /api/properties/[id]
Content-Type: application/json

{
  "status": "registered",
  "registryNumber": "REG-2024-001"
}
```

#### Delete Property
```bash
DELETE /api/properties/[id]
```

## Using Models in Code

### Example: Create a Property
```typescript
import connect from '@/lib/db';
import Property from '@/models/Property';

export async function createProperty(data: any) {
  await connect();
  
  const property = new Property({
    ...data,
    location: {
      type: 'Point',
      coordinates: [data.longitude, data.latitude],
    },
  });
  
  await property.save();
  return property;
}
```

### Example: Query Properties
```typescript
import connect from '@/lib/db';
import Property from '@/models/Property';

export async function getProperties(filters: any = {}) {
  await connect();
  
  return await Property.find(filters)
    .populate('owner', 'firstName lastName email')
    .sort({ createdAt: -1 });
}
```

### Example: Use in Next.js Pages
```typescript
import { useEffect, useState } from 'react';

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetch('/api/properties')
      .then(res => res.json())
      .then(data => setProperties(data.data));
  }, []);

  return (
    <div>
      {properties.map(prop => (
        <div key={prop._id}>
          <h2>{prop.title}</h2>
          <p>{prop.address}</p>
        </div>
      ))}
    </div>
  );
}
```

## Development Tips

1. **Testing API Routes**: Use Postman, Insomnia, or curl
2. **Database Inspection**: Use MongoDB Atlas UI or MongoDB Compass
3. **Hot Reload**: The dev server will auto-reload on model changes
4. **Error Handling**: Always wrap `connect()` calls in try-catch
5. **Population**: Use `.populate()` to get referenced document data

## File Structure

```
models/
├── User.ts          # User/Account schema
├── Property.ts      # Property/Land schema
└── LandRegistry.ts  # Official registry records

lib/
└── db.ts            # MongoDB connection management

src/app/api/
├── properties/
│   ├── route.ts          # GET all, POST create
│   └── [id]/
│       └── route.ts      # GET, PUT, DELETE single

.env.local          # MongoDB connection string (NEVER commit)
```

## Next Steps

1. Update `.env.local` with your MongoDB connection string
2. Start the dev server: `npm run dev`
3. Test API endpoints with your data
4. Build authentication middleware
5. Add more models/routes for users, registry, etc.
