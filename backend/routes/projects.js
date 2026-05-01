const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect, authorize } = require('../middleware/auth');
// const { validateProject } = require('../middleware/validation');

// @route   GET /api/projects
// @desc    Get all projects (filtered by user role)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    // Admins can see all projects, members only see their own
    if (req.user.role === 'member') {
      query = {
        $or: [
          { created_by: req.user._id },
          { team_members: req.user._id }
        ]
      };
    }

    const projects = await Project.find(query)
      .populate('created_by', 'username full_name email')
      .populate('team_members', 'username full_name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: { projects }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching projects'
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('created_by', 'username full_name email')
      .populate('team_members', 'username full_name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check if user has access to this project
    if (req.user.role === 'member') {
      const hasAccess = project.created_by._id.toString() === req.user._id.toString() ||
                       project.team_members.some(member => member._id.toString() === req.user._id.toString());
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this project'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: { project }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching project'
    });
  }
});

// @route   POST /api/projects
// @desc    Create new project
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, description, status, priority, team_members, end_date } = req.body;

    const project = await Project.create({
      name,
      description,
      status,
      priority,
      created_by: req.user._id,
      team_members: team_members || [],
      end_date
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating project'
    });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('created_by', 'username full_name email')
     .populate('team_members', 'username full_name email');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: { project }
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating project'
    });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting project'
    });
  }
});

module.exports = router;
