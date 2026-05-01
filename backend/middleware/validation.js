const { validationResult } = require('express-validator');
const { body } = require('express-validator');

// Validation error handler
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  
  next();
};

// User validation rules
exports.validateUser = [
  // Username validation
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  
  // Email validation
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  // Password validation
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  // Full name validation
  body('full_name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  
  // Role validation
  body('role')
    .optional()
    .isIn(['admin', 'member']).withMessage('Role must be either admin or member'),
  
  handleValidationErrors
];

// Login validation rules
exports.validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  handleValidationErrors
];

// Project validation rules
exports.validateProject = [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Project name must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  
  body('status')
    .optional()
    .isIn(['active', 'completed', 'on-hold', 'cancelled']).withMessage('Invalid status'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  
  handleValidationErrors
];

// Task validation rules
exports.validateTask = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Task title must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  
  body('project')
    .notEmpty().withMessage('Project is required')
    .isMongoId().withMessage('Invalid project ID'),
  
  body('assigned_to')
    .notEmpty().withMessage('Assigned user is required')
    .isMongoId().withMessage('Invalid user ID'),
  
  handleValidationErrors
];
