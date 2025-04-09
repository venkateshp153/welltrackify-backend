import { generateToken, verifyToken } from '../config/jwt.js';
import { createUser,
  getUserByEmail,
  updateUserPassword,
  setPasswordResetToken,
  getUserByResetToken,
  clearResetToken} from '../models/userModel.js';
import ApiError from '../utils/apiError.js';
import bcrypt from 'bcryptjs';
import logger from '../config/logger.js';

const signUp = async (email, password, name) => {
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new ApiError(400, 'Email already in use');
    }

    // Create new user
    const user = await createUser(email, password, name);
    
    // Generate JWT token
    const token = generateToken(user.id);
    
    return { user, token };
  } catch (error) {
    logger.error('Signup service error:', error.message);
    throw error;
  }
};

// src/services/authService.js
export const signIn = async (email, password) => {
  try {
    // 1. Check if user exists
    const user = await getUserByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Incorrect email or password');
    }

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Incorrect email or password');
    }

    // 3. Generate token
    const token = generateToken(user.id);

    // 4. Return user data (without password) and token
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;

    return { user: userWithoutPassword, token };
  } catch (error) {
    logger.error('SignIn service error:', error.message);
    throw error;
  }
};

const forgotPassword = async (email) => {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      // Don't reveal if user doesn't exist for security
      return;
    }

    // Generate reset token (using JWT for simplicity)
    const resetToken = generateToken(user.id);
    const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await setPasswordResetToken(email, resetToken, resetExpires);
    
    // In a real app, you would send an email here
    return resetToken;
  } catch (error) {
    logger.error('Forgot password service error:', error.message);
    throw error;
  }
};

const resetPassword = async (token, newPassword) => {
  try {
    // Verify token and get user
    const decoded = verifyToken(token);
    if (!decoded) {
      throw new ApiError(400, 'Invalid or expired token');
    }

    const user = await getUserByResetToken(token);
    if (!user) {
      throw new ApiError(400, 'Invalid or expired token');
    }

    // Update password
    await updateUserPassword(user.id, newPassword);
    
    // Clear reset token
    await clearResetToken(user.id);
  } catch (error) {
    logger.error('Reset password service error:', error.message);
    throw error;
  }
};

export default {
  signUp,
  signIn,
  forgotPassword,
  resetPassword
};