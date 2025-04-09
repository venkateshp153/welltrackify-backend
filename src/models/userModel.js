import { query } from '../config/db.js';
import bcrypt from 'bcryptjs';
import logger from '../config/logger.js';

export const createUser = async (email, password, name) => {
  const hashedPassword = await bcrypt.hash(password, 12);
  
  try {
    // Check if email already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      throw new Error('Email already in use');
    }

    const result = await query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
      [email, hashedPassword, name]
    );

    return result.rows[0];
  } catch (error) {
    logger.error('Error creating user:', error);
    throw error;
  }
};

export const getUserByEmail = async (email) => {
  try {
    const result = await query(
      'SELECT id, email, name, password FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  } catch (error) {
    logger.error('Error getting user by email:', error);
    throw error;
  }
};

export const updateUserPassword = async (userId, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  try {
    const result = await query(
      'UPDATE users SET password = $1 WHERE id = $2 RETURNING id',
      [hashedPassword, userId]
    );
    return result.rowCount > 0;
  } catch (error) {
    logger.error('Error updating user password:', error);
    throw error;
  }
};

export const setPasswordResetToken = async (email, token, expires) => {
  try {
    const result = await query(
      'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE email = $3 RETURNING id',
      [token, expires, email]
    );
    return result.rowCount > 0;
  } catch (error) {
    logger.error('Error setting password reset token:', error);
    throw error;
  }
};

export const getUserByResetToken = async (token) => {
  try {
    const result = await query(
      'SELECT id, email FROM users WHERE password_reset_token = $1 AND password_reset_expires > NOW()',
      [token]
    );
    return result.rows[0] || null;
  } catch (error) {
    logger.error('Error getting user by reset token:', error);
    throw error;
  }
};

export const clearResetToken = async (userId) => {
  try {
    const result = await query(
      'UPDATE users SET password_reset_token = NULL, password_reset_expires = NULL WHERE id = $1 RETURNING id',
      [userId]
    );
    return result.rowCount > 0;
  } catch (error) {
    logger.error('Error clearing reset token:', error);
    throw error;
  }
};

export default {
  createUser,
  getUserByEmail,
  updateUserPassword,
  setPasswordResetToken,
  getUserByResetToken,
  clearResetToken,
};
