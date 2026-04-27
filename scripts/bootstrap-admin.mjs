import { randomBytes, scryptSync } from 'node:crypto';
import mongoose from 'mongoose';
import 'dotenv/config';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is required');
}

const email = (process.env.ADMIN_EMAIL || 'admin@terraledger.gov').toLowerCase().trim();
const firstName = process.env.ADMIN_FIRST_NAME || 'Admin';
const lastName = process.env.ADMIN_LAST_NAME || 'User';
const password = process.env.ADMIN_PASSWORD || 'ChangeMe@123';

function hashPassword(rawPassword) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(rawPassword, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

await mongoose.connect(uri, { bufferCommands: false });
const users = mongoose.connection.collection('users');

const now = new Date();
const existing = await users.findOne({ email });

if (!existing) {
  await users.insertOne({
    email,
    password: hashPassword(password),
    firstName,
    lastName,
    role: 'admin',
    createdAt: now,
    updatedAt: now,
  });
  console.log(`Created admin user: ${email}`);
} else {
  await users.updateOne(
    { _id: existing._id },
    {
      $set: {
        firstName,
        lastName,
        role: 'admin',
        password: hashPassword(password),
        updatedAt: now,
      },
    }
  );
  console.log(`Updated admin user: ${email}`);
}

await mongoose.disconnect();
console.log('Bootstrap complete.');

