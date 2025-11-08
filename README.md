# Task Manager API

A lightweight RESTful API built with Node.js and Express.js for managing tasks. This API provides full CRUD functionality with in-memory storage, making it perfect for learning and prototyping.

## Features

✅ **Complete CRUD Operations** - Create, Read, Update, and Delete tasks  
✅ **Input Validation** - Comprehensive validation for all task fields  
✅ **Error Handling** - Graceful error handling with meaningful messages  
✅ **Pagination** - Efficient data retrieval with customizable page sizes  
✅ **Filtering & Sorting** - Filter by status/priority and sort by multiple fields  
✅ **Authentication** - Simple API key-based authentication  
✅ **Authorization** - Role-based access control for sensitive operations  
✅ **Clean Architecture** - Organized code structure with separation of concerns  

## Table of Contents

- [Installation](#installation)
- [Running the API](#running-the-api)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Testing](#testing)
- [Project Structure](#project-structure)

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Steps

1. **Navigate to the project directory:**
   ```bash
   cd "c:\Users\prati\Pratik"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Verify installation:**
   ```bash
   node --version
   npm --version
   ```

## Running the API

### Start the server:

```bash
npm start
```

The server will start on `http://localhost:3000`

You should see output similar to:
```
========================================
Task Manager API is running
Server: http://localhost:3000
Environment: development
========================================
```

### Stop the server:
Press `Ctrl + C` in the terminal

## API Documentation

### Base URL
```
http://localhost:3000
```

### Response Format

All responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "data": { },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

---

## Endpoints

### 1. Get All Tasks

**Endpoint:** `GET /tasks`

**Description:** Retrieves a paginated list of all tasks with optional filtering and sorting.

**Query Parameters:**

| Parameter | Type   | Default | Description                                    |
|-----------|--------|---------|------------------------------------------------|
| page      | number | 1       | Page number (min: 1)                          |
| limit     | number | 10      | Tasks per page (min: 1, max: 100)             |
| status    | string | -       | Filter by status: `pending`, `in-progress`, `completed` |
| priority  | string | -       | Filter by priority: `low`, `medium`, `high`   |
| search    | string | -       | Search in title and description               |
| sortBy    | string | id      | Sort field: `id`, `title`, `createdAt`, `updatedAt`, `priority` |
| order     | string | asc     | Sort order: `asc` or `desc`                   |

**Example Request:**
```bash
curl http://localhost:3000/tasks
```

**Example with filters:**
```bash
curl "http://localhost:3000/tasks?status=pending&priority=high&page=1&limit=5&sortBy=createdAt&order=desc"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Complete project documentation",
      "description": "Write comprehensive documentation for the API project",
      "status": "pending",
      "priority": "high",
      "createdAt": "2025-11-01T10:00:00.000Z",
      "updatedAt": "2025-11-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalTasks": 3,
    "tasksPerPage": 10,
    "hasNextPage": false,
    "hasPreviousPage": false
  },
  "filters": {
    "status": "all",
    "priority": "all",
    "search": "none",
    "sortBy": "id",
    "order": "asc"
  }
}
```

---

### 2. Get Task by ID

**Endpoint:** `GET /tasks/:id`

**Description:** Retrieves a specific task by its ID.

**URL Parameters:**
- `id` (required) - Task ID (must be a positive integer)

**Example Request:**
```bash
curl http://localhost:3000/tasks/1
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Complete project documentation",
    "description": "Write comprehensive documentation for the API project",
    "status": "pending",
    "priority": "high",
    "createdAt": "2025-11-01T10:00:00.000Z",
    "updatedAt": "2025-11-01T10:00:00.000Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Task not found",
  "message": "No task found with ID 999"
}
```

---

### 3. Create New Task

**Endpoint:** `POST /tasks`

**Description:** Creates a new task.

**Authentication:** Required (API Key)

**Headers:**
```
Content-Type: application/json
x-api-key: admin-key-12345
```

**Request Body:**

| Field       | Type   | Required | Description                                    |
|-------------|--------|----------|------------------------------------------------|
| title       | string | Yes      | Task title (3-100 characters)                 |
| description | string | Yes      | Task description (min 5 characters)           |
| status      | string | No       | Task status: `pending`, `in-progress`, `completed` (default: `pending`) |
| priority    | string | No       | Task priority: `low`, `medium`, `high` (default: `medium`) |

**Example Request:**
```bash
curl -X POST http://localhost:3000/tasks ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: admin-key-12345" ^
  -d "{\"title\":\"Fix login bug\",\"description\":\"Resolve authentication issue on login page\",\"status\":\"pending\",\"priority\":\"high\"}"
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 4,
    "title": "Fix login bug",
    "description": "Resolve authentication issue on login page",
    "status": "pending",
    "priority": "high",
    "createdAt": "2025-11-07T10:30:00.000Z",
    "updatedAt": "2025-11-07T10:30:00.000Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Please check the provided data",
  "details": [
    "Title is required",
    "Description must be at least 5 characters long"
  ]
}
```

---

### 4. Update Task

**Endpoint:** `PUT /tasks/:id`

**Description:** Updates an existing task.

**Authentication:** Required (API Key)

**Headers:**
```
Content-Type: application/json
x-api-key: admin-key-12345
```

**URL Parameters:**
- `id` (required) - Task ID

**Request Body:** (All fields optional, but at least one should be provided)

| Field       | Type   | Description                                    |
|-------------|--------|------------------------------------------------|
| title       | string | Task title (3-100 characters)                 |
| description | string | Task description (min 5 characters)           |
| status      | string | Task status: `pending`, `in-progress`, `completed` |
| priority    | string | Task priority: `low`, `medium`, `high`        |

**Example Request:**
```bash
curl -X PUT http://localhost:3000/tasks/1 ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: admin-key-12345" ^
  -d "{\"status\":\"completed\",\"priority\":\"medium\"}"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": 1,
    "title": "Complete project documentation",
    "description": "Write comprehensive documentation for the API project",
    "status": "completed",
    "priority": "medium",
    "createdAt": "2025-11-01T10:00:00.000Z",
    "updatedAt": "2025-11-07T11:00:00.000Z"
  }
}
```

---

### 5. Delete Task

**Endpoint:** `DELETE /tasks/:id`

**Description:** Deletes a task permanently.

**Authentication:** Required (Admin API Key only)

**Headers:**
```
x-api-key: admin-key-12345
```

**URL Parameters:**
- `id` (required) - Task ID

**Example Request:**
```bash
curl -X DELETE http://localhost:3000/tasks/1 ^
  -H "x-api-key: admin-key-12345"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "deletedTaskId": 1
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "You do not have permission to access this resource"
}
```

---

## Authentication

This API uses a simple API key-based authentication system for demonstration purposes.

### Available API Keys

| API Key           | Role  | Permissions                                    |
|-------------------|-------|------------------------------------------------|
| admin-key-12345   | admin | Full access (create, update, delete tasks)    |
| user-key-67890    | user  | Limited access (create, update tasks only)    |

### How to Use

Include the API key in the request header:

```
x-api-key: admin-key-12345
```

### Protected Endpoints

- `POST /tasks` - Requires authentication (admin or user)
- `PUT /tasks/:id` - Requires authentication (admin or user)
- `DELETE /tasks/:id` - Requires admin role

### Public Endpoints

- `GET /tasks` - No authentication required
- `GET /tasks/:id` - No authentication required

---

## Testing

### Using cURL (Windows PowerShell)

**1. Get all tasks:**
```bash
curl http://localhost:3000/tasks
```

**2. Get specific task:**
```bash
curl http://localhost:3000/tasks/1
```

**3. Create a task:**
```bash
curl -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -H "x-api-key: admin-key-12345" -d "{\"title\":\"New Task\",\"description\":\"Task description here\",\"priority\":\"high\"}"
```

**4. Update a task:**
```bash
curl -X PUT http://localhost:3000/tasks/1 -H "Content-Type: application/json" -H "x-api-key: admin-key-12345" -d "{\"status\":\"completed\"}"
```

**5. Delete a task:**
```bash
curl -X DELETE http://localhost:3000/tasks/1 -H "x-api-key: admin-key-12345"
```

### Using Postman

1. **Import the collection** (see `postman-examples.json`)
2. **Set base URL** as `http://localhost:3000`
3. **Add API key** in Headers: `x-api-key: admin-key-12345`
4. **Test each endpoint** with different parameters

### Test Script

A test script is provided in `test-api.ps1` for automated testing. Run it with:

```bash
./test-api.ps1
```

---

## Status Codes

| Code | Description                                           |
|------|-------------------------------------------------------|
| 200  | OK - Request successful                               |
| 201  | Created - Resource created successfully               |
| 400  | Bad Request - Invalid input or validation error       |
| 401  | Unauthorized - Missing or invalid API key             |
| 403  | Forbidden - Insufficient permissions                  |
| 404  | Not Found - Resource not found                        |
| 500  | Internal Server Error - Unexpected server error       |

---

## Error Handling

The API includes comprehensive error handling:

- **Validation Errors** - Detailed feedback on invalid input
- **Not Found Errors** - Clear messages when resources don't exist
- **Authentication Errors** - Helpful hints for authentication issues
- **Server Errors** - Graceful handling of unexpected issues

All errors return a consistent JSON format with helpful messages.

---

## Project Structure

```
c:\Users\prati\Pratik\
│
├── server.js                    # Main application entry point
├── package.json                 # Project dependencies and scripts
├── .gitignore                   # Git ignore rules
├── README.md                    # This file
│
├── controllers/
│   └── taskController.js        # Business logic for task operations
│
├── models/
│   └── taskStore.js             # In-memory data storage
│
├── routes/
│   └── taskRoutes.js            # API route definitions
│
├── middleware/
│   ├── errorHandler.js          # Error handling middleware
│   └── auth.js                  # Authentication & authorization
│
└── tests/
    ├── test-api.ps1             # PowerShell test script
    └── example-requests.txt      # Sample cURL commands
```

---

## Task Properties

Each task has the following properties:

```javascript
{
  id: number,              // Auto-generated unique identifier
  title: string,           // Task title (3-100 chars)
  description: string,     // Task description (min 5 chars)
  status: string,          // 'pending' | 'in-progress' | 'completed'
  priority: string,        // 'low' | 'medium' | 'high'
  createdAt: Date,         // ISO 8601 timestamp
  updatedAt: Date          // ISO 8601 timestamp
}
```

---

## Features in Detail

### Pagination
- Default: 10 items per page
- Customizable via `page` and `limit` query parameters
- Maximum limit: 100 items per page
- Response includes pagination metadata

### Filtering
- Filter by status: `?status=pending`
- Filter by priority: `?priority=high`
- Search in title/description: `?search=documentation`
- Combine multiple filters

### Sorting
- Sort by any field: `?sortBy=createdAt`
- Ascending or descending: `?order=desc`
- Default: Sort by ID ascending

### Validation
- Title: 3-100 characters, required for creation
- Description: minimum 5 characters, required for creation
- Status: must be valid status value
- Priority: must be valid priority value
- Comprehensive error messages

---

## Notes

- **Data Persistence:** Tasks are stored in memory. Data will be lost when the server restarts.
- **Initial Data:** The API starts with 3 sample tasks for testing.
- **Concurrency:** Not designed for production concurrent use.
- **Security:** API key authentication is for demonstration only. Use proper authentication in production.

---

## Future Enhancements

- [ ] Add database integration (MongoDB/PostgreSQL)
- [ ] Implement JWT-based authentication
- [ ] Add task categories and tags
- [ ] Add due dates and reminders
- [ ] Implement rate limiting
- [ ] Add request logging
- [ ] Create automated test suite
- [ ] Add API documentation with Swagger/OpenAPI

---

## Troubleshooting

**Problem:** Port 3000 already in use  
**Solution:** Change the port in `server.js` or kill the process using port 3000

**Problem:** Module not found error  
**Solution:** Run `npm install` to install all dependencies

**Problem:** Cannot find curl command  
**Solution:** Use PowerShell's `Invoke-RestMethod` or install curl for Windows

---

## License

ISC

---

## Author

Created as a learning project for RESTful API development with Node.js and Express.js.

---

## Support

For issues or questions, please review the documentation or check the code comments for additional context.
