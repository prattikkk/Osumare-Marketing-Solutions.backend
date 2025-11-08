const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);

// Protected routes (authentication required)
router.post('/', authenticate, taskController.createTask);
router.put('/:id', authenticate, taskController.updateTask);
router.delete('/:id', authenticate, authorize('admin'), taskController.deleteTask);

module.exports = router;
