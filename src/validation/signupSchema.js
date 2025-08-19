// src/validation/signupSchema.js
import Joi from "joi";

export const signupSchema = Joi.object({
  fname: Joi.string()
    .required()
    .min(2)
    .max(50)
    .regex(/^[A-Za-z]+$/)
    .messages({
      "string.pattern.base": "First name can only contain letters",
      "string.empty": "First name cannot be empty",
      "string.min": "First name must be at least 2 characters long",
      "string.max": "First name cannot exceed 50 characters",
      "any.required": "First name is required"
    }),

  lname: Joi.string()
    .required()
    .min(2)
    .max(50)
    .regex(/^[A-Za-z]+$/)
    .messages({
      "string.pattern.base": "Last name can only contain letters",
      "string.empty": "Last name cannot be empty",
      "string.min": "Last name must be at least 2 characters long",
      "string.max": "Last name cannot exceed 50 characters",
      "any.required": "Last name is required"
    }),

  email: Joi.string()
    .required()
    .email({ tlds: { allow: false } })
    .messages({
      "string.email": "Please enter a valid email address",
      "string.empty": "Email cannot be empty",
      "any.required": "Email is required"
    }),

  phone: Joi.string()
    .required()
    .regex(/^\+?[0-9]{7,15}$/)
    .messages({
      "string.pattern.base": "Please enter a valid phone number (7-15 digits)",
      "string.empty": "Phone number cannot be empty",
      "any.required": "Phone number is required"
    }),

  location: Joi.string()
    .required()
    .min(2)
    .max(100)
    .messages({
      "string.empty": "Location cannot be empty",
      "string.min": "Location must be at least 2 characters long",
      "string.max": "Location cannot exceed 100 characters",
      "any.required": "Location is required"
    }),

  gender: Joi.string()
    .required()
    .valid("Male", "Female", "Other")
    .messages({
      "any.only": "Please select a valid gender",
      "any.required": "Gender is required"
    }),

  role: Joi.string()
    .valid("admin", "operator", "overseer", "guest")
    .default("guest")
    .messages({
      "any.only": "Please select a valid role"
    })
});