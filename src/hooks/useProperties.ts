import { useEffect, useState, useCallback } from 'react';
import { LandRecord, Property } from '@/types';
import {
  fetchPropertiesFromDB,
  fetchPropertyById,
  fetchPropertiesFiltered,
  createProperty,
  updateProperty,
  deleteProperty,
} from '@/lib/propertyService';

interface UsePropertiesOptions {
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

interface UsePropertiesReturn {
  properties: LandRecord[];
  loading: boolean;
  error: string | null;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  refetch: () => Promise<void>;
  fetchFiltered: (filters: { status?: string; type?: string }) => Promise<void>;
  createNew: (data: Omit<Property, '_id' | 'createdAt' | 'updatedAt'>) => Promise<LandRecord>;
  update: (id: string, updates: Partial<Property>) => Promise<LandRecord>;
  delete: (id: string) => Promise<void>;
}

/**
 * Hook for fetching and managing properties from MongoDB
 * 
 * @param options Configuration options
 * @returns Properties data and management functions
 * 
 * @example
 * const { properties, loading, error, refetch } = useProperties();
 * 
 * // Fetch filtered properties
 * await fetchFiltered({ status: 'registered' });
 * 
 * // Create new property
 * const newProp = await createNew({ title: 'My Property', ... });
 * 
 * // Update property
 * await update(propId, { status: 'pending' });
 * 
 * // Delete property
 * await delete(propId);
 */
export function useProperties(options: UsePropertiesOptions = {}): UsePropertiesReturn {
  const { page = 1, limit = 10, autoFetch = true } = options;

  const [properties, setProperties] = useState<LandRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>();

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPropertiesFromDB(page, limit);
      setProperties(data);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errMsg);
      console.error('Failed to fetch properties:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const fetchFiltered = useCallback(
    async (filters: { status?: string; type?: string }) => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPropertiesFiltered({ ...filters, page, limit });
        setProperties(data);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errMsg);
        console.error('Failed to fetch filtered properties:', err);
      } finally {
        setLoading(false);
      }
    },
    [page, limit]
  );

  const createNew = useCallback(async (data: Omit<Property, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newProp = await createProperty(data);
      setProperties(prev => [newProp, ...prev]);
      return newProp;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errMsg);
      throw err;
    }
  }, []);

  const update = useCallback(async (id: string, updates: Partial<Property>) => {
    try {
      const updated = await updateProperty(id, updates);
      setProperties(prev => prev.map(p => (p._id === id ? updated : p)));
      return updated;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errMsg);
      throw err;
    }
  }, []);

  const deleteProperty_ = useCallback(async (id: string) => {
    try {
      await deleteProperty(id);
      setProperties(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errMsg);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      refetch();
    }
  }, [autoFetch, refetch]);

  return {
    properties,
    loading,
    error,
    pagination,
    refetch,
    fetchFiltered,
    createNew,
    update,
    delete: deleteProperty_,
  };
}

/**
 * Hook for fetching a single property by ID
 * 
 * @param id Property ID (optional)
 * @returns Property data and refetch function
 * 
 * @example
 * const { property, loading, error } = usePropertyById(propId);
 */
export function usePropertyById(id?: string) {
  const [property, setProperty] = useState<LandRecord | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPropertyById(id);
      setProperty(data);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errMsg);
      console.error('Failed to fetch property:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      refetch();
    }
  }, [id, refetch]);

  return { property, loading, error, refetch };
}
