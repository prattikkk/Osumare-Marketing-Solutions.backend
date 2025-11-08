
# Technical Report: Osumare Marketing Solutions Task Management API

**Version:** 1.0
**Date:** November 8, 2025
**Author:** GitHub Copilot

## 1. Overview

This document outlines the architectural design, technical approach, and algorithmic choices for the Osumare Marketing Solutions Task Management API. The primary goal was to create a simple, scalable, and maintainable backend service using Node.js and the Express framework. The API provides standard CRUD (Create, Read, Update, Delete) operations for managing tasks, incorporating features like pagination, filtering, sorting, and role-based access control.

## 2. Architectural Approach

The application follows a layered, service-oriented architecture, which promotes a strong separation of concerns. This makes the codebase modular, easier to debug, and simpler to scale.

The main layers are:

-   **Routes (`/routes`):** This layer defines the API endpoints (e.g., `/tasks`, `/tasks/:id`) and maps them to the appropriate controller functions. It is also responsible for applying route-specific middleware, such as authentication and authorization checks.

-   **Controllers (`/controllers`):** Controllers act as the bridge between the routes and the data layer. They are responsible for handling incoming HTTP requests, validating user input, calling the appropriate data storage functions, and formatting the final JSON response to be sent to the client.

-   **Model/Data Store (`/models`):** This layer abstracts the data storage mechanism. For this project, an **in-memory data store** was chosen for its simplicity and speed, avoiding the need for an external database setup. This layer contains all the logic for data manipulation (creating, reading, updating, deleting) and complex queries (filtering, sorting). This design means we could easily swap it out for a persistent database like PostgreSQL or MongoDB in the future with minimal changes to the controllers.

-   **Middleware (`/middleware`):** This layer handles cross-cutting concerns that apply to multiple routes.
    -   **Authentication (`auth.js`):** Secures endpoints by verifying JSON Web Tokens (JWTs).
    -   **Authorization (`auth.js`):** Implements role-based access control (e.g., allowing only `admin` users to delete tasks).
    -   **Error Handling (`errorHandler.js`):** A centralized middleware that catches all errors thrown within the application and formats them into a consistent, user-friendly JSON response.

This layered approach ensures that business logic is decoupled from the web server framework and data storage details.

## 3. Core Features and Algorithm Choices

### 3.1. Data Storage: In-Memory Array

-   **Choice:** A simple JavaScript array (`let tasks = [...]`) serves as the database.
-   **Reasoning:** For the scope of this project, an in-memory solution is highly efficient and requires zero configuration. It is perfect for development, testing, and scenarios where data persistence between server restarts is not required. Each task is a JSON object with a unique, auto-incrementing ID.

### 3.2. Task Retrieval: Filtering, Sorting, and Pagination

The `GET /tasks` endpoint is the most complex, and its implementation was chosen for efficiency and flexibility.

-   **Filtering Algorithm:**
    -   **Approach:** A linear scan (`Array.prototype.filter()`) is applied to the tasks array. The function checks each task against the provided query parameters (`status`, `priority`, `search`).
    -   **Reasoning:** With a dataset that fits in memory, a linear scan is perfectly acceptable and simple to implement. The time complexity is **O(n)**, where *n* is the total number of tasks. For a significantly larger dataset, indexing (e.g., using hash maps for status and priority) would be a better approach to achieve O(1) or O(log n) lookups.

-   **Sorting Algorithm:**
    -   **Approach:** The native `Array.prototype.sort()` method is used with a custom comparator function. The comparator dynamically generates its logic based on the `sortBy` and `order` query parameters.
    -   **Reasoning:** JavaScript's native sort is highly optimized (typically implementing a variation of Quicksort or Timsort) and provides an average time complexity of **O(n log n)**, which is very efficient.

-   **Pagination Algorithm:**
    -   **Approach:** After filtering and sorting, the `Array.prototype.slice()` method is used to extract the desired subset of tasks for the current page. The `startIndex` and `endIndex` are calculated based on the `page` and `limit` query parameters.
    -   **Reasoning:** This is the most direct and performant way to paginate an array. The operation is very fast, with a time complexity proportional to the number of items on the page (the `limit`), not the total number of items.

### 3.3. Input Validation

-   **Approach:** A dedicated helper function, `validateTaskData`, is used within the controllers. It checks for required fields, data types, string lengths, and enum values (e.g., `status` must be one of 'pending', 'in-progress', 'completed'). It returns an array of all validation errors.
-   **Reasoning:** Centralizing validation logic in a single function prevents code duplication and ensures that creation and update operations adhere to the same business rules. This approach makes the validation rules clear and easy to modify.

## 4. Security

-   **Authentication:** Endpoints are secured using JSON Web Tokens (JWT). A middleware function intercepts requests, checks for a valid `Bearer` token in the `Authorization` header, and verifies its signature.
-   **Authorization:** A flexible, role-based authorization middleware was implemented. It accepts an array of permitted roles (e.g., `['admin']`) and checks if the authenticated user's role is included. This makes it easy to protect specific endpoints and is more scalable than hardcoding role checks in every controller.

## 5. Conclusion and Future Improvements

The current architecture provides a solid and robust foundation for the Task Management API. The choice of an in-memory store and efficient, native JavaScript algorithms makes the API fast and lightweight.

Potential future improvements include:

1.  **Persistent Database:** Replace the in-memory store with a relational (e.g., PostgreSQL) or NoSQL (e.g., MongoDB) database to ensure data persistence.
2.  **Caching:** For high-traffic scenarios, implement a caching layer (e.g., with Redis) to store frequently accessed data, reducing the load on the database.
3.  **Advanced Validation:** Adopt a dedicated validation library like `Joi` or `express-validator` to further streamline and strengthen input validation.
4.  **Logging:** Integrate a robust logging library (like `Winston` or `Pino`) to record application events, errors, and requests for easier debugging and monitoring.
