const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    minlength: [3, 'Task title must be at least 3 characters'],
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'completed', 'cancelled'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned user is required']
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  due_date: {
    type: Date
  },
  completed_at: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
taskSchema.index({ project: 1 });
taskSchema.index({ assigned_to: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ project: 1, assigned_to: 1 });

module.exports = mongoose.model('Task', taskSchema);
