// src/config/jwt.js
import jwt from 'jsonwebtoken';
import logger from './logger.js';

// Named exports
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    logger.error('JWT verification failed:', err.message);
    return null;
  }
};

// Or as default export
export default {
  generateToken,
  verifyToken
};