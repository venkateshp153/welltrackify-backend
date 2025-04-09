import express from 'express';
import { signUpController,signInController,forgotPasswordController,resetPasswordController } from '../controllers/authController.js';
import authValidation from '../validations/authValidations.js';
import validateRequest from '../middlewares/validateRequest.js';

const router = express.Router();

router.post('/signup', validateRequest(authValidation .signUp), signUpController);
router.post('/signin', validateRequest(authValidation .signIn), signInController);
router.post('/forgot-password', validateRequest(authValidation .forgotPassword), forgotPasswordController);
router.post('/reset-password/:token', validateRequest(authValidation .resetPassword), resetPasswordController);

// Export the router as default export
export const authRouter = router;