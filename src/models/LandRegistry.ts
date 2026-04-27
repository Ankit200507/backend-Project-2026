import mongoose, { Schema, Document } from 'mongoose';

export interface ILandRegistry extends Document {
  property: mongoose.Types.ObjectId;
  registrarNumber: string;
  registrationDate: Date;
  legalDescription: string;
  owner: mongoose.Types.ObjectId;
  previousOwners?: Array<{
    name: string;
    dateRange: {
      from: Date;
      to: Date;
    };
  }>;
  encumbrances?: string[]; // mortgages, liens, etc.
  certificateUrl?: string;
  status: 'active' | 'transferred' | 'disputed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LandRegistrySchema = new Schema<ILandRegistry>(
  {
    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    registrarNumber: {
      type: String,
      required: [true, 'Registrar number is required'],
      unique: true,
    },
    registrationDate: {
      type: Date,
      required: true,
    },
    legalDescription: {
      type: String,
      required: [true, 'Legal description is required'],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    previousOwners: [
      {
        name: String,
        dateRange: {
          from: Date,
          to: Date,
        },
      },
    ],
    encumbrances: [String],
    certificateUrl: String,
    status: {
      type: String,
      enum: ['active', 'transferred', 'disputed', 'cancelled'],
      default: 'active',
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.LandRegistry || mongoose.model<ILandRegistry>('LandRegistry', LandRegistrySchema);
