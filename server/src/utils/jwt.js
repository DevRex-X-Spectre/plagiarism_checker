import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { JWT_EXPIRY } from '../config/constants.js';

export function signToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}
