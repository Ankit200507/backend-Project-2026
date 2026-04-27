import type { PropertyApi } from '@/types';

type LeanOwner = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
};

type LeanProperty = {
  _id: string;
  title: string;
  description?: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  area: number;
  propertyType: 'residential' | 'commercial' | 'agricultural' | 'industrial';
  owner: LeanOwner;
  registryNumber?: string;
  surveyNumber?: string;
  documentUrl?: string;
  status: 'registered' | 'pending' | 'disputed';
  geometry?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  createdAt: Date | string;
  updatedAt: Date | string;
};

export function toPropertyApi(property: LeanProperty): PropertyApi {
  return {
    _id: String(property._id),
    title: property.title,
    description: property.description,
    address: property.address,
    location: property.location,
    area: property.area,
    propertyType: property.propertyType,
    owner: {
      _id: String(property.owner._id),
      email: property.owner.email,
      firstName: property.owner.firstName,
      lastName: property.owner.lastName,
      role: property.owner.role,
    },
    registryNumber: property.registryNumber,
    surveyNumber: property.surveyNumber,
    documentUrl: property.documentUrl,
    status: property.status,
    geometry: property.geometry,
    createdAt: new Date(property.createdAt).toISOString(),
    updatedAt: new Date(property.updatedAt).toISOString(),
  };
}

