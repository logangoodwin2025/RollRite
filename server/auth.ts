import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET || 'default-secret';

if (process.env.NODE_ENV === 'production' && jwtSecret === 'default-secret') {
  console.warn('Warning: Using default JWT secret in production. Please set a strong JWT_SECRET environment variable.');
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, jwtSecret, { expiresIn: '1d' });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, jwtSecret);
    return decoded as { userId: string };
  } catch (error) {
    return null;
  }
}
