// In-memory data store for tasks
class TaskStore {
  constructor() {
    this.tasks = [];
    this.currentId = 1;
    this.initializeSampleData();
  }

  // Initialize with some sample data
  initializeSampleData() {
    this.tasks = [
      {
        id: this.currentId++,
        title: 'Complete project documentation',
        description: 'Write comprehensive documentation for the API project',
        status: 'pending',
        priority: 'high',
        createdAt: new Date('2025-11-01T10:00:00Z'),
        updatedAt: new Date('2025-11-01T10:00:00Z')
      },
      {
        id: this.currentId++,
        title: 'Review pull requests',
        description: 'Review and merge pending pull requests from the team',
        status: 'in-progress',
        priority: 'medium',
        createdAt: new Date('2025-11-02T14:30:00Z'),
        updatedAt: new Date('2025-11-05T09:15:00Z')
      },
      {
        id: this.currentId++,
        title: 'Update dependencies',
        description: 'Update all npm packages to their latest versions',
        status: 'completed',
        priority: 'low',
        createdAt: new Date('2025-10-28T08:00:00Z'),
        updatedAt: new Date('2025-10-30T16:45:00Z')
      }
    ];
  }

  // Get all tasks
  getAllTasks() {
    return this.tasks;
  }

  // Get task by ID
  getTaskById(id) {
    return this.tasks.find(task => task.id === parseInt(id));
  }

  // Create new task
  createTask(taskData) {
    const newTask = {
      id: this.currentId++,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.tasks.push(newTask);
    return newTask;
  }

  // Update existing task
  updateTask(id, updateData) {
    const taskIndex = this.tasks.findIndex(task => task.id === parseInt(id));
    
    if (taskIndex === -1) {
      return null;
    }

    const existingTask = this.tasks[taskIndex];
    const updatedTask = {
      ...existingTask,
      ...updateData,
      id: existingTask.id, // Ensure ID cannot be changed
      createdAt: existingTask.createdAt, // Preserve creation date
      updatedAt: new Date()
    };

    this.tasks[taskIndex] = updatedTask;
    return updatedTask;
  }

  // Delete task
  deleteTask(id) {
    const taskIndex = this.tasks.findIndex(task => task.id === parseInt(id));
    
    if (taskIndex === -1) {
      return false;
    }

    this.tasks.splice(taskIndex, 1);
    return true;
  }

  // Filter tasks based on criteria
  filterTasks(filters) {
    let filteredTasks = [...this.tasks];

    if (filters.status) {
      filteredTasks = filteredTasks.filter(task => 
        task.status.toLowerCase() === filters.status.toLowerCase()
      );
    }

    if (filters.priority) {
      filteredTasks = filteredTasks.filter(task => 
        task.priority.toLowerCase() === filters.priority.toLowerCase()
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      );
    }

    return filteredTasks;
  }

  // Sort tasks
  sortTasks(tasks, sortBy, order = 'asc') {
    const sorted = [...tasks].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt) - new Date(b.updatedAt);
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        default:
          comparison = a.id - b.id;
      }

      return order === 'desc' ? -comparison : comparison;
    });

    return sorted;
  }

  // Get tasks count
  getTasksCount() {
    return this.tasks.length;
  }
}

// Export a single instance (singleton pattern)
module.exports = new TaskStore();
