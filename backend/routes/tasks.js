const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect, authorize } = require('../middleware/auth');
// const { validateTask } = require('../middleware/validation');

// @route   GET /api/tasks
// @desc    Get all tasks (filtered by user role)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    // Admins can see all tasks, members only see their assigned tasks
    if (req.user.role === 'member') {
      query = { assigned_to: req.user._id };
    }

    const tasks = await Task.find(query)
      .populate('project', 'name description status')
      .populate('assigned_to', 'username full_name email')
      .populate('created_by', 'username full_name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: { tasks }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching tasks'
    });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name description status')
      .populate('assigned_to', 'username full_name email')
      .populate('created_by', 'username full_name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check if user has access to this task
    if (req.user.role === 'member') {
      if (task.assigned_to._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this task'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: { task }
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching task'
    });
  }
});

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { title, description, status, priority, project, assigned_to, due_date } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      project,
      assigned_to,
      created_by: req.user._id,
      due_date
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating task'
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Members can only update status of their own tasks
    if (req.user.role === 'member') {
      if (task.assigned_to._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this task'
        });
      }
      // Members can only update status
      const allowedUpdates = ['status'];
      const updates = Object.keys(req.body);
      const isValidOperation = updates.every(update => allowedUpdates.includes(update));
      
      if (!isValidOperation) {
        return res.status(403).json({
          success: false,
          error: 'Members can only update task status'
        });
      }
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('project', 'name description status')
     .populate('assigned_to', 'username full_name email')
     .populate('created_by', 'username full_name email');

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating task'
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting task'
    });
  }
});

module.exports = router;
