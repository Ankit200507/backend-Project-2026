import { LandRecord, Property } from '@/types';

/**
 * Service for fetching and managing properties from MongoDB
 */

export interface PropertiesResponse {
  success: boolean;
  data: Property[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  error?: string;
}

/**
 * Fetch all properties from MongoDB
 */
export async function fetchPropertiesFromDB(page = 1, limit = 10): Promise<LandRecord[]> {
  try {
    const response = await fetch(`/api/properties?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data: PropertiesResponse = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch properties');
    }

    // Convert Property objects to LandRecord format
    return data.data.map(propertyToLandRecord);
  } catch (error) {
    console.error('Error fetching properties from DB:', error);
    throw error;
  }
}

/**
 * Fetch a single property by ID
 */
export async function fetchPropertyById(id: string): Promise<LandRecord> {
  try {
    const response = await fetch(`/api/properties/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch property');
    }

    return propertyToLandRecord(data.data);
  } catch (error) {
    console.error('Error fetching property by ID:', error);
    throw error;
  }
}

/**
 * Fetch properties by filter
 */
export async function fetchPropertiesFiltered(filters: {
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}): Promise<LandRecord[]> {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const response = await fetch(`/api/properties?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data: PropertiesResponse = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch properties');
    }

    return data.data.map(propertyToLandRecord);
  } catch (error) {
    console.error('Error fetching filtered properties:', error);
    throw error;
  }
}

/**
 * Create a new property in MongoDB
 */
export async function createProperty(propertyData: Omit<Property, '_id' | 'createdAt' | 'updatedAt'>): Promise<LandRecord> {
  try {
    const response = await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(propertyData),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to create property');
    }

    return propertyToLandRecord(data.data);
  } catch (error) {
    console.error('Error creating property:', error);
    throw error;
  }
}

/**
 * Update a property in MongoDB
 */
export async function updateProperty(
  id: string,
  updates: Partial<Property>
): Promise<LandRecord> {
  try {
    const response = await fetch(`/api/properties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to update property');
    }

    return propertyToLandRecord(data.data);
  } catch (error) {
    console.error('Error updating property:', error);
    throw error;
  }
}

/**
 * Delete a property from MongoDB
 */
export async function deleteProperty(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/properties/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to delete property');
    }
  } catch (error) {
    console.error('Error deleting property:', error);
    throw error;
  }
}

/**
 * Convert backend Property to frontend LandRecord format
 */
function propertyToLandRecord(prop: Property): LandRecord {
  return {
    ...prop,
    _id: prop._id,
    id: prop._id,
    titleNumber: prop.registryNumber,
    parcelId: prop.surveyNumber,
    registeredDate: prop.createdAt,
    lastUpdated: prop.updatedAt,
    landUse: prop.propertyType,
  } as LandRecord;
}
