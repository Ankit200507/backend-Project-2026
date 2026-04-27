import { randomBytes } from 'node:crypto';
import User from '@/models/User';
import type { AuthUser, PropertyOwnerInput } from '@/types';
import { hashPassword, verifyPassword } from '@/server/auth/password';

type UserDocument = {
  _id: { toString: () => string } | string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  password?: string;
};

export function toAuthUser(user: UserDocument): AuthUser {
  return {
    _id: String(user._id),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  let user = await User.findOne({ email }).select('+password').lean<UserDocument | null>();
  
  if (!user && email === (process.env.ADMIN_EMAIL || 'admin@terraledger.gov').toLowerCase()) {
    // Auto-bootstrap admin
    const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe@123';
    if (password === adminPassword) {
      const created = await User.create({
        email,
        password: hashPassword(password),
        firstName: process.env.ADMIN_FIRST_NAME || 'Admin',
        lastName: process.env.ADMIN_LAST_NAME || 'User',
        role: 'admin',
      });
      user = created.toObject() as unknown as UserDocument;
    }
  }

  if (!user || !user.password) return null;
  if (!verifyPassword(password, user.password)) return null;
  return toAuthUser(user);
}

export async function resolveOrCreateOwner(owner: PropertyOwnerInput): Promise<string> {
  if (owner.id) return owner.id;

  const existingUser = await User.findOne({ email: owner.email }).lean<UserDocument | null>();
  if (existingUser) return String(existingUser._id);

  const randomPassword = randomBytes(16).toString('hex');
  const hashedPassword = hashPassword(randomPassword);

  const created = await User.create({
    email: owner.email.toLowerCase().trim(),
    password: hashedPassword,
    firstName: owner.firstName.trim(),
    lastName: owner.lastName.trim(),
    role: 'user',
  });

  return String(created._id);
}

