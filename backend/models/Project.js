const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    minlength: [3, 'Project name must be at least 3 characters'],
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'on-hold', 'cancelled'],
    default: 'active'
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  team_members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  start_date: {
    type: Date,
    default: Date.now
  },
  end_date: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Index for faster queries
projectSchema.index({ created_by: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ team_members: 1 });

module.exports = mongoose.model('Project', projectSchema);
