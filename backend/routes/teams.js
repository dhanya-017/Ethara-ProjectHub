const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const Project = require('../models/Project');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/teams
// @desc    Get all team memberships
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    // Admins can see all teams, members only see their own
    if (req.user.role === 'member') {
      query = { user: req.user._id };
    }

    const teams = await Team.find(query)
      .populate('user', 'username full_name email')
      .populate('project', 'name description status')
      .sort({ joined_at: -1 });

    res.status(200).json({
      success: true,
      count: teams.length,
      data: { teams }
    });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching teams'
    });
  }
});

// @route   POST /api/teams
// @desc    Add team member to project
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { user, project, role } = req.body;

    // Check if user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check if user is already in team
    const existingTeam = await Team.findOne({ user, project });
    if (existingTeam) {
      return res.status(400).json({
        success: false,
        error: 'User is already a member of this project'
      });
    }

    const team = await Team.create({
      user,
      project,
      role: role || 'member'
    });

    // Add user to project's team members
    await Project.findByIdAndUpdate(project, {
      $push: { team_members: user }
    });

    res.status(201).json({
      success: true,
      message: 'Team member added successfully',
      data: { team }
    });
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while adding team member'
    });
  }
});

// @route   DELETE /api/teams/:id
// @desc    Remove team member from project
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team membership not found'
      });
    }

    // Remove user from project's team members
    await Project.findByIdAndUpdate(team.project, {
      $pull: { team_members: team.user }
    });

    await team.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Team member removed successfully'
    });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while removing team member'
    });
  }
});

module.exports = router;
