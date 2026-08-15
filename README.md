# Week 4 - File Uploads, Pagination, Filtering & Search

## Project Description
This project adds file-upload support to tasks and upgrades the task list endpoint with pagination, filtering, and search, on top of an existing authenticated (JWT) task management API.

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Atlas)
- **Authentication:** JWT (jsonwebtoken), bcryptjs
- **File Uploads:** Multer
- **Frontend:** HTML, CSS, JavaScript (Vanilla)

## Folder Structure

week4-project/
- server/
  - models/
    - User.js
    - Task.js (title, description, completed, attachment, owner)
  - routes/
    - authRoutes.js
    - taskRoutes.js (upload + pagination/filter/search)
  - middleware/
    - authMiddleware.js
    - uploadMiddleware.js (Multer config - file type/size validation)
  - uploads/ (Uploaded files stored here, not committed to git)
  - server.js
  - .env (not committed)
  - .env.example
- client/
  - register.html
  - login.html
  - dashboard.html (upload, search, filter, pagination)
- README.md

## Setup Instructions

### Backend Setup
1. Navigate to the server folder: `cd server`
2. Install dependencies: `npm install`
3. Create a `.env` file (copy `.env.example` and fill in real values):
   - MONGODB_URI=your_mongodb_connection_string
   - JWT_SECRET=your_secret_key
   - PORT=5000
4. Start the server: `node server.js`

### Frontend Setup
1. Navigate to the client folder
2. Open `register.html` in a browser to create an account
3. Log in via `login.html`
4. You will be redirected to `dashboard.html` to manage tasks

## Feature: File Uploads

### How It Works
1. The frontend sends task data (title, description, attachment) as `multipart/form-data` using the browser's `FormData` object, because a file cannot be sent as JSON text.
2. The `multer` middleware (`uploadMiddleware.js`) intercepts the request before the route handler runs.
3. The uploaded file is validated:
   - **Allowed types:** JPG, PNG, PDF only
   - **Max size:** 5MB
   - Invalid files are rejected with a clear error message and are never saved to disk.
4. Accepted files are renamed using a unique suffix (`Date.now() + random number`) before saving, so the original filename is never trusted or used directly for storage.
5. The file is saved to the local `uploads/` folder, and its relative path (e.g. `/uploads/12345-6789.png`) is stored on the Task document in MongoDB.
6. The file is served back to the frontend through a static route (`app.use('/uploads', express.static('uploads'))`), so it can be viewed directly in the browser via a link.

### Example Request (multipart/form-data)
POST /api/tasks
- title: "Grocery Shopping"
- description: "Buy milk and eggs"
- attachment: (file)

## Feature: Pagination, Filtering & Search

All three work together on the same endpoint: `GET /api/tasks`

| Query Parameter | Purpose | Example |
|---|---|---|
| `page` | Which page of results to return (default: 1) | `?page=2` |
| `limit` | How many results per page (default: 5) | `?limit=10` |
| `completed` | Filter by completion status (`true` or `false`) | `?completed=true` |
| `search` | Partial, case-insensitive match on task title | `?search=grocery` |

### Combined Example
GET /api/tasks?page=1&limit=5&completed=false&search=shoppingThis returns page 1, 5 results per page, only incomplete tasks, whose title contains "shopping" (case-insensitive).

### Response Shape
```json
{
  "tasks": [ ... ],
  "currentPage": 1,
  "totalPages": 3,
  "totalTasks": 12
}
```

The query respects ownership - a user only ever sees their own tasks, regardless of the filters applied.

## Protected Endpoints

| Method | Endpoint            | Protected | Ownership Check | Notes |
|--------|----------------------|-----------|------------------|-------|
| POST   | /api/auth/register   | No        | -                | |
| POST   | /api/auth/login      | No        | -                | Rate limited (5/15min) |
| POST   | /api/tasks           | Yes       | -                | Accepts multipart/form-data with optional file |
| GET    | /api/tasks           | Yes       | Returns only own tasks | Supports page, limit, completed, search |
| GET    | /api/tasks/all       | Yes       | Admin only       | |
| PUT    | /api/tasks/:id       | Yes       | Yes              | |
| DELETE | /api/tasks/:id       | Yes       | Yes              | |

## Features Implemented
- File upload with type and size validation (Multer)
- Uploaded files stored on disk and referenced on the task record
- Uploaded files served back to the frontend via a static route
- Offset/limit pagination on the task list endpoint
- Filtering by completion status
- Case-insensitive partial search by title
- Frontend upload form, search box, filter dropdown, and pagination controls
- Existing authentication/ownership rules preserved throughout

## Testing Notes
- Tested file upload with a valid image (PNG) - accepted and stored correctly.
- Tested that the uploaded file is viewable directly via its `/uploads/...` URL in the browser.
- Tested pagination, filter, and search independently and combined, via Postman and the frontend UI.
- Confirmed a user only ever sees and manages their own tasks.

## Author
Faizan Asif