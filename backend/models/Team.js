const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'member', 'viewer'],
    default: 'member'
  },
  joined_at: {
    type: Date,
    default: Date.now
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate user-project combinations
teamSchema.index({ user: 1, project: 1 }, { unique: true });
teamSchema.index({ project: 1 });
teamSchema.index({ user: 1 });

module.exports = mongoose.model('Team', teamSchema);
