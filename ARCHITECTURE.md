# Task Manager API - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                            │
│  (Browser, Postman, cURL, Mobile App, etc.)                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP Requests (JSON)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                       EXPRESS SERVER                             │
│                      (server.js)                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Middleware Stack:                                        │  │
│  │  • express.json() - Parse JSON bodies                     │  │
│  │  • express.urlencoded() - Parse URL-encoded data          │  │
│  │  • Request Logger - Log all incoming requests             │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ROUTING LAYER                               │
│                   (routes/taskRoutes.js)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Routes:                                                  │  │
│  │  GET    /tasks         → getAllTasks()                    │  │
│  │  GET    /tasks/:id     → getTaskById()                    │  │
│  │  POST   /tasks         → createTask()      [AUTH]         │  │
│  │  PUT    /tasks/:id     → updateTask()      [AUTH]         │  │
│  │  DELETE /tasks/:id     → deleteTask()      [AUTH+ADMIN]   │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE LAYER                              │
│                                                                  │
│  ┌──────────────────────────┐  ┌──────────────────────────┐    │
│  │   Authentication         │  │   Authorization          │    │
│  │  (middleware/auth.js)    │  │  (middleware/auth.js)    │    │
│  │                          │  │                          │    │
│  │  • Validate API Key      │  │  • Check User Role       │    │
│  │  • Attach User to Req    │  │  • Admin/User Access     │    │
│  └──────────────────────────┘  └──────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CONTROLLER LAYER                               │
│              (controllers/taskController.js)                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Business Logic:                                          │  │
│  │  • Input Validation                                       │  │
│  │  • Data Processing                                        │  │
│  │  • Filter & Sort Logic                                    │  │
│  │  • Pagination Calculations                                │  │
│  │  • Response Formatting                                    │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│                  (models/taskStore.js)                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  In-Memory Storage (Array):                               │  │
│  │                                                           │  │
│  │  tasks = [                                                │  │
│  │    { id, title, description, status, priority, ... },    │  │
│  │    { id, title, description, status, priority, ... },    │  │
│  │    ...                                                    │  │
│  │  ]                                                        │  │
│  │                                                           │  │
│  │  Operations:                                              │  │
│  │  • getAllTasks()                                          │  │
│  │  • getTaskById(id)                                        │  │
│  │  • createTask(data)                                       │  │
│  │  • updateTask(id, data)                                   │  │
│  │  • deleteTask(id)                                         │  │
│  │  • filterTasks(filters)                                   │  │
│  │  • sortTasks(tasks, sortBy, order)                        │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING                                │
│               (middleware/errorHandler.js)                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  • Catch all errors                                       │  │
│  │  • Format error responses                                 │  │
│  │  • Log error details                                      │  │
│  │  • Return appropriate status codes                        │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow Example

### Example: Creating a New Task

```
1. CLIENT sends POST request
   ↓
   POST http://localhost:3000/tasks
   Headers: { "x-api-key": "admin-key-12345", "Content-Type": "application/json" }
   Body: { "title": "New Task", "description": "Task details", "priority": "high" }

2. EXPRESS SERVER receives request
   ↓
   • Parses JSON body
   • Logs request: [2025-11-07T10:30:00] POST /tasks

3. ROUTING LAYER matches route
   ↓
   POST /tasks → Apply authenticate middleware → Call createTask controller

4. AUTHENTICATION MIDDLEWARE
   ↓
   • Check x-api-key header
   • Validate against VALID_API_KEYS
   • Attach user info to request
   • Continue to controller

5. CONTROLLER validates and processes
   ↓
   • Validate title (3-100 chars, required)
   • Validate description (min 5 chars, required)
   • Validate priority (low/medium/high)
   • If valid: call taskStore.createTask()
   • If invalid: return 400 error

6. DATA LAYER creates task
   ↓
   • Generate new ID
   • Add timestamps (createdAt, updatedAt)
   • Push to tasks array
   • Return new task object

7. CONTROLLER formats response
   ↓
   Return 201 with JSON:
   {
     "success": true,
     "message": "Task created successfully",
     "data": { id: 4, title: "New Task", ... }
   }

8. CLIENT receives response
   ↓
   Status: 201 Created
   Body: Task object with generated ID and timestamps
```

## Data Flow Diagram

```
┌──────────────┐
│   Request    │
│  (JSON Data) │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  Middleware Stack    │
│  • Parse JSON        │
│  • Authenticate      │
│  • Authorize         │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│    Controller        │
│  • Validate Input    │
│  • Business Logic    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│   Data Store         │
│  • CRUD Operations   │
│  • In-Memory Array   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│   Response           │
│  (JSON + Status)     │
└──────────────────────┘
```

## Authentication & Authorization Flow

```
Request with API Key
       ↓
┌─────────────────────┐
│ authenticate()      │
│ middleware          │
└──────┬──────────────┘
       │
       ├─── No API Key → 401 Unauthorized
       │
       ├─── Invalid Key → 401 Invalid API key
       │
       └─── Valid Key
              ↓
       ┌──────────────────┐
       │ Attach user info │
       │ to request       │
       └──────┬───────────┘
              │
              ▼
       ┌──────────────────┐
       │ authorize()      │
       │ middleware       │
       │ (if required)    │
       └──────┬───────────┘
              │
              ├─── Role not allowed → 403 Forbidden
              │
              └─── Role allowed
                     ↓
              ┌──────────────────┐
              │ Proceed to       │
              │ Controller       │
              └──────────────────┘
```

## Error Handling Flow

```
Error Occurs in:
│
├─── Validation Error (Controller)
│    → return 400 Bad Request with details
│
├─── Not Found Error (Controller)
│    → return 404 Not Found with message
│
├─── Authentication Error (Middleware)
│    → return 401 Unauthorized
│
├─── Authorization Error (Middleware)
│    → return 403 Forbidden
│
└─── Unexpected Error (Any layer)
     → Caught by errorHandler middleware
     → return 500 Internal Server Error
```

## File Responsibilities

| File | Responsibility |
|------|---------------|
| `server.js` | Server setup, middleware config, start listening |
| `routes/taskRoutes.js` | Define API endpoints and route to controllers |
| `controllers/taskController.js` | Handle requests, validate input, business logic |
| `models/taskStore.js` | Data storage and CRUD operations |
| `middleware/auth.js` | Authentication and authorization logic |
| `middleware/errorHandler.js` | Centralized error handling |

## Key Design Patterns

1. **MVC Pattern** (Modified)
   - Model: taskStore.js (Data layer)
   - View: JSON responses (API responses)
   - Controller: taskController.js (Business logic)

2. **Middleware Pattern**
   - Chain of responsibility for request processing
   - Authentication → Authorization → Controller → Error Handler

3. **Singleton Pattern**
   - TaskStore is exported as a single instance
   - Shared data across all requests

4. **Dependency Injection**
   - Controllers depend on taskStore
   - Easy to mock for testing

## Status Code Usage

| Code | Usage |
|------|-------|
| 200 | Successful GET, PUT operations |
| 201 | Successful POST (resource created) |
| 400 | Validation errors, bad input |
| 401 | Missing or invalid authentication |
| 403 | Valid auth but insufficient permissions |
| 404 | Resource not found |
| 500 | Unexpected server errors |
