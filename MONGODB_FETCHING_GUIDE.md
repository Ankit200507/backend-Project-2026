# MongoDB Data Fetching - Quick Setup Guide

## New Files Created

### 📁 `/src/lib/propertyService.ts`
**Purpose**: Service layer that handles all MongoDB API calls

**Main Functions**:
```typescript
// Fetch all properties
fetchPropertiesFromDB(page, limit) → Promise<LandRecord[]>

// Fetch single property
fetchPropertyById(id) → Promise<LandRecord>

// Fetch with filters
fetchPropertiesFiltered({ status, type, page, limit }) → Promise<LandRecord[]>

// Create new property
createProperty(data) → Promise<LandRecord>

// Update property
updateProperty(id, updates) → Promise<LandRecord>

// Delete property
deleteProperty(id) → Promise<void>
```

### 🎣 `/src/hooks/useProperties.ts`
**Purpose**: React hooks for using properties in components

**Hook 1: `useProperties(options)`**
```typescript
const { properties, loading, error, refetch, fetchFiltered, createNew, update, delete } = useProperties({
    limit: 100,
    autoFetch: true
});
```

**Hook 2: `usePropertyById(id)`**
```typescript
const { property, loading, error, refetch } = usePropertyById(id);
```

### 📄 Updated `/src/app/properties/page.tsx`
**Changes**:
- Now uses `useProperties` hook instead of context
- Better error handling with debugging tips
- Refresh button to reload data from MongoDB
- Shows "from MongoDB" indicator

---

## Testing Steps

### Step 1: Populate Database
```
http://localhost:3000/api/seed
```
✅ Creates test users and properties

### Step 2: Check Connection
```
http://localhost:3000/api/health
```
Should return:
```json
{
  "success": true,
  "status": "healthy",
  "database": {
    "connected": true,
    "name": "terraledger",
    "host": "terracluster.mh8z4mt.mongodb.net"
  }
}
```

### Step 3: View Properties
Navigate to:
```
http://localhost:3000/properties
```

✅ Should show:
- Properties loaded from MongoDB
- Loading state while fetching
- Error state with debugging tips if connection fails
- Refresh button to reload data
- Split view and List view options
- Search and filter functionality

### Step 4: Test Refresh
- Click the "Refresh" button
- Should reload data from MongoDB
- Shows "Refreshing..." state

---

## How to Use in Your Components

### Example 1: Display Properties List
```typescript
'use client';
import { useProperties } from '@/hooks/useProperties';

export default function PropertiesList() {
  const { properties, loading, error, refetch } = useProperties({
    limit: 20,
    autoFetch: true
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <button onClick={refetch}>Refresh</button>
      <ul>
        {properties.map(p => (
          <li key={p._id}>{p.title} - {p.status}</li>
        ))}
      </ul>
    </>
  );
}
```

### Example 2: Create New Property
```typescript
const { createNew } = useProperties();

const handleCreate = async () => {
  try {
    const newProp = await createNew({
      title: 'My Property',
      address: '123 Main St',
      area: 5000,
      propertyType: 'residential',
      owner: 'user@example.com',
      status: 'pending'
    });
    console.log('Created:', newProp);
  } catch (error) {
    console.error('Failed to create:', error);
  }
};
```

### Example 3: View Single Property
```typescript
import { usePropertyById } from '@/hooks/useProperties';

export default function PropertyDetail({ id }) {
  const { property, loading, error } = usePropertyById(id);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!property) return <div>Not found</div>;

  return (
    <div>
      <h1>{property.title}</h1>
      <p>{property.address}</p>
      <p>Status: {property.status}</p>
    </div>
  );
}
```

### Example 4: Filter Properties
```typescript
const { fetchFiltered } = useProperties();

const handleFilterByStatus = async () => {
  await fetchFiltered({ status: 'registered' });
};
```

---

## Data Flow

```
Component (useProperties hook)
    ↓
propertyService.fetchPropertiesFromDB()
    ↓
/api/properties (GET)
    ↓
MongoDB Query
    ↓
Transform: Property → LandRecord
    ↓
Return to component
```

---

## Environment Setup Required

Make sure `.env.local` has:
```
MONGODB_URI=mongodb+srv://anmol0042:<password>@terracluster.mh8z4mt.mongodb.net/terraledger?appName=terracluster
NODE_ENV=development
```

---

## Troubleshooting

### Issue: "Cannot find module @/hooks/useProperties"
**Solution**: Make sure you're using the new hook path from `/src/hooks/useProperties.ts`

### Issue: Properties not loading
1. Check MongoDB connection at `/api/health`
2. Seed database at `/api/seed`
3. Check browser console for errors
4. Verify MONGODB_URI in .env.local

### Issue: Data not refreshing
- Click the Refresh button on properties page
- Or call `refetch()` from the hook

### Issue: Cannot display property type
- Verify propertyType is one of: 'residential', 'commercial', 'agricultural', 'industrial'

---

## Migration from LandRegistryContext

If you have components still using the old context:

**Old**: `const { properties } = useLandRegistry();`
**New**: `const { properties } = useProperties();`

The API is similar, but the new hook is:
- ✅ More reliable
- ✅ Better error handling
- ✅ Direct MongoDB connection
- ✅ Simpler to debug
