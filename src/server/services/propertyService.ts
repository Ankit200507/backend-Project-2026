import { Types } from 'mongoose';
import Property from '@/models/Property';
import type { PropertyApi, PropertyCreateInput, PropertyStatus, PropertyType, PropertyUpdateInput } from '@/types';
import { toPropertyApi } from '@/server/contracts/property';
import { resolveOrCreateOwner } from '@/server/services/userService';

export interface ListPropertiesParams {
  status?: PropertyStatus;
  propertyType?: PropertyType;
  page: number;
  limit: number;
}

export interface ListPropertiesResult {
  items: PropertyApi[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export async function listProperties(params: ListPropertiesParams): Promise<ListPropertiesResult> {
  const filter: { status?: PropertyStatus; propertyType?: PropertyType } = {};
  if (params.status) filter.status = params.status;
  if (params.propertyType) filter.propertyType = params.propertyType;

  const skip = (params.page - 1) * params.limit;
  const properties = await Property.find(filter)
    .populate('owner', 'email firstName lastName role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(params.limit)
    .lean();

  const total = await Property.countDocuments(filter);
  return {
    items: properties.map((property) => toPropertyApi(property as never)),
    total,
    page: params.page,
    limit: params.limit,
    pages: Math.ceil(total / params.limit),
  };
}

export async function getPropertyByIdOrRegistry(id: string): Promise<PropertyApi | null> {
  let property = null;
  if (Types.ObjectId.isValid(id)) {
    property = await Property.findById(id).populate('owner', 'email firstName lastName role').lean();
  }

  if (!property && id.includes('-')) {
    property = await Property.findOne({ registryNumber: id })
      .populate('owner', 'email firstName lastName role')
      .lean();
  }

  if (!property) return null;
  return toPropertyApi(property as never);
}

export async function createPropertyRecord(input: PropertyCreateInput): Promise<PropertyApi> {
  const ownerId = await resolveOrCreateOwner(input.owner);

  const created = await Property.create({
    ...input,
    owner: ownerId,
  });

  const populated = await Property.findById(created._id)
    .populate('owner', 'email firstName lastName role')
    .lean();

  if (!populated) {
    throw new Error('Created property could not be loaded');
  }
  return toPropertyApi(populated as never);
}

export async function updatePropertyRecord(id: string, updates: PropertyUpdateInput): Promise<PropertyApi | null> {
  if (!Types.ObjectId.isValid(id)) return null;

  const nextUpdates = { ...updates } as Record<string, unknown>;
  if (updates.owner) {
    nextUpdates.owner = await resolveOrCreateOwner(updates.owner);
  }

  const property = await Property.findByIdAndUpdate(id, nextUpdates, {
    new: true,
    runValidators: true,
  })
    .populate('owner', 'email firstName lastName role')
    .lean();

  if (!property) return null;
  return toPropertyApi(property as never);
}

