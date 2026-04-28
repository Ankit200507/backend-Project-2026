import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  phoneNumber?: string;
  address?: string;
  aadharNumber?: string; // 12-digit Aadhar number
  profileImage?: string;
  accountType: 'individual' | 'organization';
  nominees: Array<{
    user: mongoose.Types.ObjectId;
    relationship: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
    },
    lastName: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    phoneNumber: String,
    aadharNumber: {
      type: String,
      match: [/^\d{12}$/, 'Aadhar must be a 12-digit number'],
      unique: true,
      sparse: true, // Allows null values while maintaining unique constraint
    },
    address: String,
    profileImage: String,
    accountType: {
      type: String,
      enum: ['individual', 'organization'],
      default: 'individual',
    },
    nominees: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        relationship: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.model<IUser>('User', UserSchema);
