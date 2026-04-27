import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
  title: string;
  description?: string;
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  area: number; // in square meters
  propertyType: 'residential' | 'commercial' | 'agricultural' | 'industrial';
  owner: mongoose.Types.ObjectId;
  registryNumber?: string;
  surveyNumber?: string;
  documentUrl?: string;
  status: 'pending' | 'registered' | 'disputed';
  geometry?: {
    type: 'Polygon';
    coordinates: number[][][]; // GeoJSON polygon coordinates
  };
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    title: {
      type: String,
      required: [true, 'Property title is required'],
    },
    description: String,
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    area: {
      type: Number,
      required: [true, 'Area is required'],
    },
    propertyType: {
      type: String,
      enum: ['residential', 'commercial', 'agricultural', 'industrial'],
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    registryNumber: String,
    surveyNumber: String,
    documentUrl: String,
    status: {
      type: String,
      enum: ['pending', 'registered', 'disputed'],
      default: 'pending',
    },
    geometry: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location queries
PropertySchema.index({ location: '2dsphere' });

export default mongoose.models.Property || mongoose.model<IProperty>('Property', PropertySchema);
