import { useEffect, useState, useCallback } from 'react';
import type {
  LandRecord,
  PropertyCreateInput,
  PropertyStatus,
  PropertyType,
  PropertyUpdateInput,
} from '@/types';
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
  fetchFiltered: (filters: { status?: PropertyStatus; type?: PropertyType }) => Promise<void>;
  createNew: (data: PropertyCreateInput) => Promise<LandRecord>;
  update: (id: string, updates: PropertyUpdateInput) => Promise<LandRecord>;
  delete: (id: string) => Promise<void>;
}

export function useProperties(options: UsePropertiesOptions = {}): UsePropertiesReturn {
  const { page = 1, limit = 25, autoFetch = true } = options;

  const [properties, setProperties] = useState<LandRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UsePropertiesReturn['pagination']>();

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchPropertiesFromDB(page, limit);
      setProperties(result.properties);
      setPagination(result.pagination);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const fetchFiltered = useCallback(
    async (filters: { status?: PropertyStatus; type?: PropertyType }) => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchPropertiesFiltered({ ...filters, page, limit });
        setProperties(result.properties);
        setPagination(result.pagination);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    },
    [page, limit]
  );

  const createNew = useCallback(async (data: PropertyCreateInput) => {
    const created = await createProperty(data);
    setProperties((prev) => [created, ...prev]);
    return created;
  }, []);

  const update = useCallback(async (id: string, updates: PropertyUpdateInput) => {
    const updated = await updateProperty(id, updates);
    setProperties((prev) => prev.map((p) => (p._id === id ? updated : p)));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteProperty(id);
    setProperties((prev) => prev.filter((p) => p._id !== id));
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
    delete: remove,
  };
}

export function usePropertyById(id?: string) {
  const [property, setProperty] = useState<LandRecord | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
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

