export type PropertyStatus = 'registered' | 'pending' | 'disputed';
export type PropertyType = 'residential' | 'commercial' | 'agricultural' | 'industrial';
export type UserRole = 'admin' | 'user';

export interface GeoPoint {
    lat: number;
    lng: number;
}

// Backend API Property interface
export interface Property {
    _id: string;
    title: string;
    description?: string;
    address: string;
    location: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    area: number;
    propertyType: PropertyType;
    owner: string | User; // User ID or populated User object
    registryNumber?: string;
    surveyNumber?: string;
    documentUrl?: string;
    status: PropertyStatus;
    geometry?: {
        type: 'Polygon';
        coordinates: number[][][]; // GeoJSON polygon
    };
    createdAt: string;
    updatedAt: string;
}

// Frontend display format (extends Property with additional fields)
export interface LandRecord extends Property {
    id?: string; // Alias for _id
    titleNumber?: string; // Alias for registryNumber
    parcelId?: string; // Alias for surveyNumber
    ownerName?: string;
    ownerNID?: string;
    ownerEmail?: string;
    district?: string;
    state?: string;
    country?: string;
    registeredDate?: string; // Alias for createdAt
    lastUpdated?: string; // Alias for updatedAt
    landUse?: string; // Alias for propertyType
    centroid?: GeoPoint;
    blockHash?: string;
    previousHash?: string;
    transactionHistory?: TransactionRecord[];
    documents?: DocumentRecord[];
}

export interface TransactionRecord {
    id: string;
    type: 'registration' | 'transfer' | 'update' | 'dispute';
    from: string;
    to: string;
    date: string;
    hash: string;
    notes: string;
}

export interface DocumentRecord {
    id: string;
    type: string;
    name: string;
    hash: string;
    uploadedAt: string;
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    avatar?: string;
    phoneNumber?: string;
    aadharNumber?: string;
    properties: string[]; // property IDs
    registeredAt: string;
}


export interface MapFilter {
    status: PropertyStatus | 'all';
    district: string;
    landUse: string;
}

export interface StatsData {
    totalParcels: number;
    registered: number;
    pending: number;
    disputed: number;
    totalArea: number;
    totalOwners: number;
}
