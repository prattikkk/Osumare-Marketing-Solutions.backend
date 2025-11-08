const taskStore = require('../models/taskStore');
const { AppError } = require('../middleware/errorHandler');

// Validation helper
const validateTaskData = (data, isUpdate = false) => {
  const errors = [];

  if (!isUpdate && !data.title) {
    errors.push('Title is required');
  }

  if (!isUpdate && !data.description) {
    errors.push('Description is required');
  }

  if (data.title && typeof data.title !== 'string') {
    errors.push('Title must be a string');
  }

  if (data.title && data.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }

  if (data.title && data.title.length > 100) {
    errors.push('Title must not exceed 100 characters');
  }

  if (data.description && typeof data.description !== 'string') {
    errors.push('Description must be a string');
  }

  if (data.description && data.description.trim().length < 5) {
    errors.push('Description must be at least 5 characters long');
  }

  if (data.status && !['pending', 'in-progress', 'completed'].includes(data.status)) {
    errors.push('Status must be one of: pending, in-progress, completed');
  }

  if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
    errors.push('Priority must be one of: low, medium, high');
  }

  return errors;
};

// GET /tasks - Get all tasks with pagination, filtering, and sorting
const getAllTasks = (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      priority, 
      search, 
      sortBy = 'id', 
      order = 'asc' 
    } = req.query;

    // Parse pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (pageNum < 1 || limitNum < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid pagination parameters',
        message: 'Page and limit must be positive integers'
      });
    }

    if (limitNum > 100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid limit',
        message: 'Limit cannot exceed 100'
      });
    }

    // Apply filters
    const filters = { status, priority, search };
    let tasks = taskStore.filterTasks(filters);

    // Apply sorting
    tasks = taskStore.sortTasks(tasks, sortBy, order);

    // Calculate pagination
    const totalTasks = tasks.length;
    const totalPages = Math.ceil(totalTasks / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedTasks = tasks.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedTasks,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalTasks: totalTasks,
        tasksPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1
      },
      filters: {
        status: status || 'all',
        priority: priority || 'all',
        search: search || 'none',
        sortBy,
        order
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /tasks/:id - Get task by ID
const getTaskById = (req, res, next) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID',
        message: 'Task ID must be a valid number'
      });
    }

    const task = taskStore.getTaskById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        message: `No task found with ID ${id}`
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// POST /tasks - Create new task
const createTask = (req, res, next) => {
  try {
    const { title, description, status, priority } = req.body;

    // Validate input
    const validationErrors = validateTaskData(req.body);
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Please check the provided data',
        details: validationErrors
      });
    }

    // Create task
    const newTask = taskStore.createTask({
      title: title.trim(),
      description: description.trim(),
      status,
      priority
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask
    });
  } catch (error) {
    next(error);
  }
};

// PUT /tasks/:id - Update task
const updateTask = (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID',
        message: 'Task ID must be a valid number'
      });
    }

    // Check if task exists
    const existingTask = taskStore.getTaskById(id);
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        message: `No task found with ID ${id}`
      });
    }

    // Validate input
    const validationErrors = validateTaskData(req.body, true);
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Please check the provided data',
        details: validationErrors
      });
    }

    // Prepare update data
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;

    // Update task
    const updatedTask = taskStore.updateTask(id, updateData);

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /tasks/:id - Delete task
const deleteTask = (req, res, next) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID',
        message: 'Task ID must be a valid number'
      });
    }

    const deleted = taskStore.deleteTask(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        message: `No task found with ID ${id}`
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
      deletedTaskId: parseInt(id)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
};
