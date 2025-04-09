import authService from '../services/authService.js';
import ApiResponse from '../utils/apiResponse.js';
import logger from '../config/logger.js';

export const signUpController = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const { user, token } = await authService.signUp(email, password, name);
    
    // Remove password from response
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    
    new ApiResponse(res, 201, 'User created successfully', {
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    logger.error('Signup controller error:', error.message);
    next(error);
  }
};

export const signInController = async (req, res, next) => {
  try {
    console.log('SignIn Request Body:', req.body); // Debug log
    
    const { email, password } = req.body;
    const { user, token } = await authService.signIn(email, password);
    
    console.log('SignIn Successful:', { user: user.email }); // Debug log
    
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    
    new ApiResponse(res, 200, 'Login successful', {
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('SignIn Error:', error); // Debug log
    logger.error('Signin controller error:', error.message);
    next(error);
  }
};

export const forgotPasswordController = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    
    new ApiResponse(res, 200, 'If an account with that email exists, a password reset link has been sent');
  } catch (error) {
    logger.error('Forgot password controller error:', error.message);
    next(error);
  }
};

export const resetPasswordController = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    await authService.resetPassword(token, password);
    
    new ApiResponse(res, 200, 'Password reset successfully');
  } catch (error) {
    logger.error('Reset password controller error:', error.message);
    next(error);
  }
};

// Export as named exports
export default {
  signUp: signUpController,
  signIn: signInController,
  forgotPassword: forgotPasswordController,
  resetPassword: resetPasswordController
};