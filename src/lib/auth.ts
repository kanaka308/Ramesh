import jwt from 'jsonwebtoken';
import { config } from './config';
import crypto from 'crypto';

interface MagicLinkPayload {
  email: string;
}

export const generateMagicLinkToken = (email: string): string => {
  return jwt.sign({ email }, config.jwtSecret, { expiresIn: '15m' });
};

export const verifyMagicLinkToken = (token: string): string | null => {
  try {
    const payload = jwt.verify(token, config.jwtSecret) as MagicLinkPayload;
    return payload.email;
  } catch (error) {
    return null;
  }
};

export const generateSessionToken = (email: string): string => {
  return jwt.sign({ email }, config.jwtSecret, { expiresIn: '30d' });
};

export const verifySessionToken = (token: string): string | null => {
  try {
    const payload = jwt.verify(token, config.jwtSecret) as MagicLinkPayload;
    return payload.email;
  } catch (error) {
    return null;
  }
};

export const verifyAdminCredentials = (username: string, password: string): boolean => {
  if (username !== config.admin.username) return false;
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  return password === config.admin.password || passwordHash === config.admin.password;
};
