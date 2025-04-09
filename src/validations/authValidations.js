// src/validations/authValidation.js
import Joi from 'joi';

const authValidation = {
  signUp: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters',
      'any.required': 'Password is required'
    }),
    name: Joi.string().required().messages({
      'any.required': 'Name is required'
    })
  }),

  signIn: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required()
  }),

  resetPassword: Joi.object({
    password: Joi.string().min(8).required()
  })
};

export default authValidation;