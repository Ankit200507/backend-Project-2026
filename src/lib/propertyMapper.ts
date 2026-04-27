import type { GeoPoint, PropertyApi, PropertyView } from '@/types';

function computeCentroid(coordinates?: number[][][]): GeoPoint | undefined {
  const ring = coordinates?.[0];
  if (!ring || ring.length === 0) return undefined;

  const [lngSum, latSum] = ring.reduce(
    (acc, point) => [acc[0] + point[0], acc[1] + point[1]],
    [0, 0]
  );
  return {
    lng: lngSum / ring.length,
    lat: latSum / ring.length,
  };
}

export function toPropertyView(property: PropertyApi): PropertyView {
  return {
    ...property,
    id: property._id,
    ownerName: `${property.owner.firstName} ${property.owner.lastName}`.trim(),
    ownerEmail: property.owner.email,
    titleNumber: property.registryNumber,
    parcelId: property.surveyNumber,
    registeredDate: property.createdAt,
    lastUpdated: property.updatedAt,
    landUse: property.propertyType,
    centroid: computeCentroid(property.geometry?.coordinates),
  };
}

