'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { LandRecord, PropertyCreateInput, PropertyStatus, PropertyType, PropertyUpdateInput } from '@/types';
import {
  createProperty,
  fetchPropertiesFiltered,
  fetchPropertiesFromDB,
  updateProperty,
} from '@/lib/propertyService';
import { useAuth } from '@/contexts/AuthContext';

interface LandRegistryContextType {
  properties: LandRecord[];
  loading: boolean;
  error: string | null;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  addProperty: (data: PropertyCreateInput) => Promise<LandRecord>;
  updateProperty: (id: string, updates: PropertyUpdateInput) => Promise<LandRecord>;
  getProperty: (id: string) => LandRecord | undefined;
  refreshProperties: () => Promise<void>;
  filterProperties: (filters: { status?: PropertyStatus; type?: PropertyType }) => Promise<void>;
}

const LandRegistryContext = createContext<LandRegistryContextType | null>(null);

export function LandRegistryProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<LandRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<LandRegistryContextType['pagination']>();

  const refreshProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchPropertiesFromDB(1, 200);
      setProperties(result.properties);
      setPagination(result.pagination);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load properties';
      setError(message);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProperties = async (filters: { status?: PropertyStatus; type?: PropertyType }) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchPropertiesFiltered({ ...filters, page: 1, limit: 200 });
      setProperties(result.properties);
      setPagination(result.pagination);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to filter properties';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const addProperty = async (data: PropertyCreateInput) => {
    const created = await createProperty(data);
    setProperties((prev) => [created, ...prev]);
    return created;
  };

  const updatePropertyRecord = async (id: string, updates: PropertyUpdateInput) => {
    const updated = await updateProperty(id, updates);
    setProperties((prev) => prev.map((item) => (item._id === id ? updated : item)));
    return updated;
  };


  const getProperty = useCallback(
    (id: string) => properties.find((item) => item._id === id || item.id === id),
    [properties]
  );

  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      void refreshProperties();
    } else {
      setLoading(false);
      setProperties([]);
    }
  }, [currentUser]);

  const value = useMemo<LandRegistryContextType>(
    () => ({
      properties,
      loading,
      error,
      pagination,
      addProperty,
      updateProperty: updatePropertyRecord,
      getProperty,
      refreshProperties,
      filterProperties,
    }),
    [properties, loading, error, pagination, getProperty]
  );

  return <LandRegistryContext.Provider value={value}>{children}</LandRegistryContext.Provider>;
}

export function useLandRegistry() {
  const ctx = useContext(LandRegistryContext);
  if (!ctx) throw new Error('useLandRegistry must be used within LandRegistryProvider');
  return ctx;
}
