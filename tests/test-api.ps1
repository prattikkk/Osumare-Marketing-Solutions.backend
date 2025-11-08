# Task Manager API - Test Script
# Run this script to test all API endpoints
# Make sure the server is running on http://localhost:3000

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Task Manager API - Automated Tests" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"
$adminKey = "admin-key-12345"
$userKey = "user-key-67890"

# Test 1: Check if server is running
Write-Host "[TEST 1] Checking if server is running..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/" -Method Get
    Write-Host "✓ Server is running!" -ForegroundColor Green
    Write-Host "Response: $($response.message)`n" -ForegroundColor Gray
} catch {
    Write-Host "✗ Server is not running. Please start the server first." -ForegroundColor Red
    Write-Host "Run: npm start`n" -ForegroundColor Yellow
    exit
}

# Test 2: Get all tasks
Write-Host "[TEST 2] GET /tasks - Fetching all tasks..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tasks" -Method Get
    Write-Host "✓ Successfully retrieved $($response.pagination.totalTasks) tasks" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 3)`n" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to fetch tasks" -ForegroundColor Red
    Write-Host "Error: $_`n" -ForegroundColor Red
}

# Test 3: Get tasks with pagination
Write-Host "[TEST 3] GET /tasks?page=1&limit=2 - Testing pagination..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tasks?page=1&limit=2" -Method Get
    Write-Host "✓ Pagination working! Got $($response.data.Count) tasks on page 1" -ForegroundColor Green
    Write-Host "Total Pages: $($response.pagination.totalPages)`n" -ForegroundColor Gray
} catch {
    Write-Host "✗ Pagination test failed" -ForegroundColor Red
    Write-Host "Error: $_`n" -ForegroundColor Red
}

# Test 4: Get tasks with filtering
Write-Host "[TEST 4] GET /tasks?status=pending - Testing filter..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tasks?status=pending" -Method Get
    Write-Host "✓ Filter working! Found $($response.pagination.totalTasks) pending tasks" -ForegroundColor Green
} catch {
    Write-Host "✗ Filter test failed" -ForegroundColor Red
    Write-Host "Error: $_`n" -ForegroundColor Red
}

# Test 5: Get specific task by ID
Write-Host "[TEST 5] GET /tasks/1 - Fetching specific task..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tasks/1" -Method Get
    Write-Host "✓ Successfully retrieved task: $($response.data.title)" -ForegroundColor Green
    Write-Host "Status: $($response.data.status), Priority: $($response.data.priority)`n" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to fetch task by ID" -ForegroundColor Red
    Write-Host "Error: $_`n" -ForegroundColor Red
}

# Test 6: Create new task with authentication
Write-Host "[TEST 6] POST /tasks - Creating new task..." -ForegroundColor Yellow
$newTask = @{
    title = "Test Task from PowerShell"
    description = "This task was created by the automated test script"
    status = "pending"
    priority = "medium"
} | ConvertTo-Json

try {
    $headers = @{
        "Content-Type" = "application/json"
        "x-api-key" = $adminKey
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/tasks" -Method Post -Headers $headers -Body $newTask
    Write-Host "✓ Task created successfully! ID: $($response.data.id)" -ForegroundColor Green
    $createdTaskId = $response.data.id
    Write-Host "Task: $($response.data.title)`n" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to create task" -ForegroundColor Red
    Write-Host "Error: $_`n" -ForegroundColor Red
}

# Test 7: Create task without authentication (should fail)
Write-Host "[TEST 7] POST /tasks - Testing without auth (should fail)..." -ForegroundColor Yellow
try {
    $headers = @{
        "Content-Type" = "application/json"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/tasks" -Method Post -Headers $headers -Body $newTask
    Write-Host "✗ This should have failed! Authentication not enforced." -ForegroundColor Red
} catch {
    Write-Host "✓ Correctly rejected request without authentication" -ForegroundColor Green
    Write-Host "Error message: $($_.Exception.Message)`n" -ForegroundColor Gray
}

# Test 8: Update task
if ($createdTaskId) {
    Write-Host "[TEST 8] PUT /tasks/$createdTaskId - Updating task..." -ForegroundColor Yellow
    $updateData = @{
        status = "completed"
        priority = "high"
    } | ConvertTo-Json

    try {
        $headers = @{
            "Content-Type" = "application/json"
            "x-api-key" = $adminKey
        }
        $response = Invoke-RestMethod -Uri "$baseUrl/tasks/$createdTaskId" -Method Put -Headers $headers -Body $updateData
        Write-Host "✓ Task updated successfully!" -ForegroundColor Green
        Write-Host "New status: $($response.data.status), New priority: $($response.data.priority)`n" -ForegroundColor Gray
    } catch {
        Write-Host "✗ Failed to update task" -ForegroundColor Red
        Write-Host "Error: $_`n" -ForegroundColor Red
    }
}

# Test 9: Validation test - Create task with missing fields (should fail)
Write-Host "[TEST 9] POST /tasks - Testing validation (should fail)..." -ForegroundColor Yellow
$invalidTask = @{
    title = "AB"
} | ConvertTo-Json

try {
    $headers = @{
        "Content-Type" = "application/json"
        "x-api-key" = $adminKey
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/tasks" -Method Post -Headers $headers -Body $invalidTask
    Write-Host "✗ Validation should have failed!" -ForegroundColor Red
} catch {
    Write-Host "✓ Validation working correctly - rejected invalid data" -ForegroundColor Green
    Write-Host "Error details: $($_.Exception.Message)`n" -ForegroundColor Gray
}

# Test 10: Delete task (admin only)
if ($createdTaskId) {
    Write-Host "[TEST 10] DELETE /tasks/$createdTaskId - Deleting task..." -ForegroundColor Yellow
    try {
        $headers = @{
            "x-api-key" = $adminKey
        }
        $response = Invoke-RestMethod -Uri "$baseUrl/tasks/$createdTaskId" -Method Delete -Headers $headers
        Write-Host "✓ Task deleted successfully!" -ForegroundColor Green
        Write-Host "Deleted task ID: $($response.deletedTaskId)`n" -ForegroundColor Gray
    } catch {
        Write-Host "✗ Failed to delete task" -ForegroundColor Red
        Write-Host "Error: $_`n" -ForegroundColor Red
    }
}

# Test 11: Try to delete with user key (should fail)
Write-Host "[TEST 11] DELETE /tasks/2 - Testing authorization (should fail)..." -ForegroundColor Yellow
try {
    $headers = @{
        "x-api-key" = $userKey
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/tasks/2" -Method Delete -Headers $headers
    Write-Host "✗ This should have failed! Authorization not enforced." -ForegroundColor Red
} catch {
    Write-Host "✓ Correctly rejected - user doesn't have delete permission" -ForegroundColor Green
    Write-Host "Error message: $($_.Exception.Message)`n" -ForegroundColor Gray
}

# Test 12: Search functionality
Write-Host "[TEST 12] GET /tasks?search=documentation - Testing search..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tasks?search=documentation" -Method Get
    Write-Host "✓ Search working! Found $($response.pagination.totalTasks) matching tasks" -ForegroundColor Green
} catch {
    Write-Host "✗ Search test failed" -ForegroundColor Red
    Write-Host "Error: $_`n" -ForegroundColor Red
}

# Test 13: Sorting functionality
Write-Host "[TEST 13] GET /tasks?sortBy=priority&order=desc - Testing sorting..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tasks?sortBy=priority&order=desc" -Method Get
    Write-Host "✓ Sorting working! Tasks ordered by priority (descending)" -ForegroundColor Green
} catch {
    Write-Host "✗ Sorting test failed" -ForegroundColor Red
    Write-Host "Error: $_`n" -ForegroundColor Red
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All tests completed! Check results above." -ForegroundColor White
Write-Host "✓ = Test Passed" -ForegroundColor Green
Write-Host "✗ = Test Failed" -ForegroundColor Red
Write-Host "========================================`n" -ForegroundColor Cyan
