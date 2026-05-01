const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [50, 'Username cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't return password by default
  },
  full_name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters'],
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member',
    required: [true, 'Role is required']
  },
  is_active: {
    type: Boolean,
    default: true
  },
  reset_password_token: String,
  reset_password_expire: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to generate password reset token
userSchema.methods.generateResetPasswordToken = function() {
  const resetToken = require('crypto').randomBytes(32).toString('hex');
  
  this.reset_password_token = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.reset_password_expire = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.reset_password_token;
  delete obj.reset_password_expire;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
