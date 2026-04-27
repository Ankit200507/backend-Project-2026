export type PropertyStatus = 'registered' | 'pending' | 'disputed';
export type PropertyType = 'residential' | 'commercial' | 'agricultural' | 'industrial';
export type UserRole = 'admin' | 'user';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface OwnerSummary {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface PropertyApi {
  _id: string;
  title: string;
  description?: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  area: number;
  propertyType: PropertyType;
  owner: OwnerSummary;
  registryNumber?: string;
  surveyNumber?: string;
  documentUrl?: string;
  status: PropertyStatus;
  geometry?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  createdAt: string;
  updatedAt: string;
}

export interface PropertyView extends PropertyApi {
  id: string;
  ownerName: string;
  ownerEmail: string;
  titleNumber?: string;
  parcelId?: string;
  registeredDate: string;
  lastUpdated: string;
  landUse: PropertyType;
  centroid?: GeoPoint;
}

export type LandRecord = PropertyView;

export interface AuthUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface PropertyOwnerInput {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface PropertyCreateInput {
  title: string;
  description?: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  area: number;
  propertyType: PropertyType;
  owner: PropertyOwnerInput;
  registryNumber?: string;
  surveyNumber?: string;
  status: PropertyStatus;
  geometry?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface PropertyUpdateInput {
  title?: string;
  description?: string;
  address?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  area?: number;
  propertyType?: PropertyType;
  registryNumber?: string;
  surveyNumber?: string;
  status?: PropertyStatus;
  geometry?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  owner?: PropertyOwnerInput;
}
