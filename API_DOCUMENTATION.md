
# Osumare Marketing Solutions - Task Management API

**Version:** 1.0.0
**Last Updated:** November 8, 2025
**Contact:** [prattikkk](https://github.com/prattikkk)

## Introduction

Welcome to the Osumare Marketing Solutions Task Management API. This document provides a comprehensive guide to interacting with the API endpoints, allowing you to manage tasks effectively. The API is designed to be RESTful, predictable, and easy to use.

All API responses are in JSON format and include a `success` boolean field to indicate the outcome of the request.

## Authentication

Most endpoints require authentication to ensure that data is accessed and modified securely. Authentication is handled via a JSON Web Token (JWT) passed in the `Authorization` header.

**Header Format:**
`Authorization: Bearer <YOUR_JWT_TOKEN>`

To obtain a token, you would typically use a dedicated login endpoint (not covered in this document). For testing purposes, you can use a pre-generated token with either `user` or `admin` roles.

- **`user` role:** Can create, read, and update tasks.
- **`admin` role:** Can perform all actions, including deleting tasks.

---

## API Endpoints

### 1. Get All Tasks

Retrieves a paginated, sorted, and filtered list of all tasks. This endpoint is public and does not require authentication.

- **Method:** `GET`
- **URL:** `/tasks`

#### Query Parameters

| Parameter | Type    | Default | Description                                                 |
|-----------|---------|---------|-------------------------------------------------------------|
| `page`    | Integer | `1`     | The page number for pagination.                             |
| `limit`   | Integer | `10`    | The number of tasks to return per page (max 100).           |
| `status`  | String  | `all`   | Filter tasks by status (`pending`, `in-progress`, `completed`). |
| `priority`| String  | `all`   | Filter tasks by priority (`low`, `medium`, `high`).         |
| `search`  | String  | `none`  | A search term to filter tasks by title or description.      |
| `sortBy`  | String  | `id`    | The field to sort by (`id`, `title`, `status`, `priority`). |
| `order`   | String  | `asc`   | The sort order (`asc` or `desc`).                           |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Complete Project Proposal",
      "description": "Draft and finalize the proposal for the new client.",
      "status": "in-progress",
      "priority": "high",
      "createdAt": "2025-11-08T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalTasks": 50,
    "tasksPerPage": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "filters": {
    "status": "in-progress",
    "priority": "all",
    "search": "none",
    "sortBy": "id",
    "order": "asc"
  }
}
```

---

### 2. Get Task by ID

Retrieves a single task by its unique identifier. This endpoint is public.

- **Method:** `GET`
- **URL:** `/tasks/:id`

#### URL Parameters

| Parameter | Type    | Description               |
|-----------|---------|---------------------------|
| `id`      | Integer | The unique ID of the task. |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Complete Project Proposal",
    "description": "Draft and finalize the proposal for the new client.",
    "status": "in-progress",
    "priority": "high",
    "createdAt": "2025-11-08T10:00:00Z"
  }
}
```

#### Error Response (404 Not Found)

```json
{
  "success": false,
  "error": "Task not found",
  "message": "No task found with ID 999"
}
```

---

### 3. Create a New Task

Adds a new task to the system. Requires authentication.

- **Method:** `POST`
- **URL:** `/tasks`
- **Authentication:** Required (`user` or `admin`)

#### Request Body

```json
{
  "title": "Design New Landing Page",
  "description": "Create mockups and a design brief for the new homepage.",
  "status": "pending",
  "priority": "medium"
}
```

| Field         | Type   | Required | Description                                                 |
|---------------|--------|----------|-------------------------------------------------------------|
| `title`       | String | Yes      | The title of the task (3-100 characters).                   |
| `description` | String | Yes      | A detailed description of the task (at least 5 characters). |
| `status`      | String | No       | `pending`, `in-progress`, or `completed`. Defaults to `pending`. |
| `priority`    | String | No       | `low`, `medium`, or `high`. Defaults to `medium`.           |

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 51,
    "title": "Design New Landing Page",
    "description": "Create mockups and a design brief for the new homepage.",
    "status": "pending",
    "priority": "medium",
    "createdAt": "2025-11-08T12:30:00Z"
  }
}
```

#### Error Response (400 Bad Request)

```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Please check the provided data",
  "details": [
    "Title must be at least 3 characters long"
  ]
}
```

---

### 4. Update an Existing Task

Modifies the details of an existing task. Requires authentication.

- **Method:** `PUT`
- **URL:** `/tasks/:id`
- **Authentication:** Required (`user` or `admin`)

#### URL Parameters

| Parameter | Type    | Description               |
|-----------|---------|---------------------------|
| `id`      | Integer | The unique ID of the task to update. |

#### Request Body

You only need to provide the fields you want to change.

```json
{
  "status": "completed",
  "priority": "high"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": 51,
    "title": "Design New Landing Page",
    "description": "Create mockups and a design brief for the new homepage.",
    "status": "completed",
    "priority": "high",
    "createdAt": "2025-11-08T12:30:00Z"
  }
}
```

---

### 5. Delete a Task

Permanently removes a task from the system. This is a protected action and requires `admin` privileges.

- **Method:** `DELETE`
- **URL:** `/tasks/:id`
- **Authentication:** Required (`admin` role only)

#### URL Parameters

| Parameter | Type    | Description               |
|-----------|---------|---------------------------|
| `id`      | Integer | The unique ID of the task to delete. |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Task deleted successfully",
  "deletedTaskId": 51
}
```

#### Error Response (403 Forbidden)

If a non-admin user attempts this action.

```json
{
  "success": false,
  "error": "Forbidden",
  "message": "You do not have permission to perform this action."
}
```
