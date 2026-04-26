'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Property, LandRecord } from '@/types';
import { MOCK_PROPERTIES } from '@/lib/mockData';

interface LandRegistryContextType {
    properties: LandRecord[];
    loading: boolean;
    error: string | null;
    addProperty: (property: Omit<Property, '_id' | 'createdAt' | 'updatedAt'> | LandRecord) => Promise<void>;
    updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
    getProperty: (id: string) => LandRecord | undefined;
    refreshProperties: () => Promise<void>;
}

const LandRegistryContext = createContext<LandRegistryContextType | null>(null);

/**
 * Convert backend Property to frontend LandRecord format
 */
function propertyToLandRecord(prop: Property): LandRecord {
    return {
        ...prop,
        id: prop._id,
        titleNumber: prop.registryNumber,
        parcelId: prop.surveyNumber,
        registeredDate: prop.createdAt,
        lastUpdated: prop.updatedAt,
        landUse: prop.propertyType,
    } as LandRecord;
}

/**
 * Convert frontend LandRecord to backend Property format
 */
function landRecordToProperty(record: Omit<Property, '_id' | 'createdAt' | 'updatedAt'> | LandRecord): Omit<Property, '_id' | 'createdAt' | 'updatedAt'> {
    const prop: any = {};
    
    // Map all fields - handle both formats
    prop.title = record.title || (record as any).ownerName;
    prop.description = record.description;
    prop.address = record.address;
    prop.area = record.area;
    prop.propertyType = record.propertyType || (record as any).landUse;
    prop.owner = record.owner || (record as any).ownerEmail;
    prop.registryNumber = record.registryNumber || (record as any).titleNumber;
    prop.surveyNumber = record.surveyNumber || (record as any).parcelId;
    prop.status = record.status;
    
    // Preserve geometry if it exists
    if ((record as any).geometry) {
        prop.geometry = (record as any).geometry;
    }
    
    // Handle location - extract from polygon centroid if not provided
    if (record.location) {
        prop.location = record.location;
    } else if ((record as any).centroid) {
        const centroid = (record as any).centroid;
        prop.location = {
            type: 'Point',
            coordinates: [centroid.lng, centroid.lat],
        };
    } else {
        prop.location = {
            type: 'Point',
            coordinates: [0, 0],
        };
    }
    
    return prop;
}

export function LandRegistryProvider({ children }: { children: ReactNode }) {
    const [properties, setProperties] = useState<LandRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/properties');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();

            if (data.success && Array.isArray(data.data)) {
                // Convert backend Property objects to frontend LandRecord format
                const records = data.data.map(propertyToLandRecord);
                setProperties(records);
                setError(null);
            } else {
                throw new Error(data.error || 'Invalid response format');
            }
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Failed to fetch properties';
            console.error('Error fetching properties:', errMsg);
            setError(errMsg);
            // Fallback to mock data only if mock data has correct format
            setProperties(MOCK_PROPERTIES as LandRecord[]);
        } finally {
            setLoading(false);
        }
    };

    const addProperty = async (propertyData: Omit<Property, '_id' | 'createdAt' | 'updatedAt'> | LandRecord) => {
        try {
            // Convert to backend format
            const backendData = landRecordToProperty(propertyData);
            
            const response = await fetch('/api/properties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(backendData),
            });

            const data = await response.json();

            if (data.success && data.data) {
                // Convert response to LandRecord format
                const newRecord = propertyToLandRecord(data.data);
                setProperties(prev => [newRecord, ...prev]);
            } else {
                throw new Error(data.error || 'Failed to create property');
            }
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error adding property:', errMsg);
            throw err;
        }
    };

    const updateProperty = async (id: string, updates: Partial<Property>) => {
        try {
            const response = await fetch(`/api/properties/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            const data = await response.json();

            if (data.success && data.data) {
                const updatedRecord = propertyToLandRecord(data.data);
                setProperties(prev => prev.map(p => p._id === id ? updatedRecord : p));
            } else {
                throw new Error(data.error || 'Failed to update property');
            }
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Unknown error';
            console.error('Error updating property:', errMsg);
            throw err;
        }
    };

    const getProperty = (id: string) => properties.find(p => p._id === id || (p as any).id === id);

    const refreshProperties = () => fetchProperties();

    useEffect(() => {
        fetchProperties();
    }, []);

    return (
        <LandRegistryContext.Provider value={{
            properties,
            loading,
            error,
            addProperty,
            updateProperty,
            getProperty,
            refreshProperties
        }}>
            {children}
        </LandRegistryContext.Provider>
    );
}

export function useLandRegistry() {
    const ctx = useContext(LandRegistryContext);
    if (!ctx) throw new Error('useLandRegistry must be used within LandRegistryProvider');
    return ctx;
}
