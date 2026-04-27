import type {
  LandRecord,
  PropertyApi,
  PropertyCreateInput,
  PropertyStatus,
  PropertyType,
  PropertyUpdateInput,
} from '@/types';
import { toPropertyView } from '@/lib/propertyMapper';

export interface PropertiesResponse {
  success: boolean;
  data: PropertyApi[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  error?: string;
}

export async function fetchPropertiesFromDB(
  page = 1,
  limit = 25
): Promise<{ properties: LandRecord[]; pagination?: PropertiesResponse['pagination'] }> {
  const response = await fetch(`/api/properties?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }

  const data = (await response.json()) as PropertiesResponse;
  if (!data.success) throw new Error(data.error || 'Failed to fetch properties');

  return {
    properties: data.data.map(toPropertyView),
    pagination: data.pagination,
  };
}

export async function fetchPropertyById(id: string): Promise<LandRecord> {
  const response = await fetch(`/api/properties/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }

  const data = (await response.json()) as { success: boolean; data: PropertyApi; error?: string };
  if (!data.success) throw new Error(data.error || 'Failed to fetch property');
  return toPropertyView(data.data);
}

export async function fetchPropertiesFiltered(filters: {
  status?: PropertyStatus;
  type?: PropertyType;
  page?: number;
  limit?: number;
}): Promise<{ properties: LandRecord[]; pagination?: PropertiesResponse['pagination'] }> {
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

  const data = (await response.json()) as PropertiesResponse;
  if (!data.success) throw new Error(data.error || 'Failed to fetch properties');

  return {
    properties: data.data.map(toPropertyView),
    pagination: data.pagination,
  };
}

export async function createProperty(propertyData: PropertyCreateInput): Promise<LandRecord> {
  const response = await fetch('/api/properties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(propertyData),
  });

  if (!response.ok) throw new Error(`API returned ${response.status}`);
  const data = (await response.json()) as { success: boolean; data: PropertyApi; error?: string };
  if (!data.success) throw new Error(data.error || 'Failed to create property');
  return toPropertyView(data.data);
}

export async function updateProperty(id: string, updates: PropertyUpdateInput): Promise<LandRecord> {
  const response = await fetch(`/api/properties/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!response.ok) throw new Error(`API returned ${response.status}`);
  const data = (await response.json()) as { success: boolean; data: PropertyApi; error?: string };
  if (!data.success) throw new Error(data.error || 'Failed to update property');
  return toPropertyView(data.data);
}

