# Week 3 & Week 4 - Auth, File Uploads, Pagination, Filtering & Search

## Project Description
This project started in Week 3 as an authenticated CRUD application (register/login, JWT authentication, ownership-based authorization). Week 4 extends it by adding file-upload support to tasks and upgrading the task list endpoint with pagination, filtering, and search.

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Atlas)
- **Authentication:** JWT (jsonwebtoken), bcryptjs (password hashing)
- **File Uploads:** Multer
- **Frontend:** HTML, CSS, JavaScript (Vanilla)

## Folder Structure

week4-project/
- server/
  - models/
    - User.js (User schema - name, email, hashed password, role)
    - Task.js (Task schema - title, description, completed, attachment, owner)
  - routes/
    - authRoutes.js (Register & Login endpoints)
    - taskRoutes.js (Protected CRUD endpoints + upload + pagination/filter/search)
  - middleware/
    - authMiddleware.js (JWT verification middleware)
    - uploadMiddleware.js (Multer config - file type/size validation)
  - uploads/ (Uploaded files stored here, not committed to git)
  - server.js (Main entry point)
  - .env (Environment variables - not committed)
  - .env.example (Template showing required variable names)
- client/
  - register.html (Registration form)
  - login.html (Login form)
  - dashboard.html (Task management dashboard - upload, search, filter, pagination)
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

## Week 4 Feature: File Uploads

### How It Works
1. The frontend sends task data (title, description, attachment) as `multipart/form-data` using the browser's `FormData` object, instead of plain JSON, because a file cannot be sent as JSON text.
2. On the backend, the `multer` middleware (`uploadMiddleware.js`) intercepts the request before the route handler runs.
3. The uploaded file is validated:
   - **Allowed types:** JPG, PNG, PDF only
   - **Max size:** 5MB
   - Invalid files are rejected with a clear error message, and are never saved to disk.
4. Accepted files are renamed using a unique suffix (`Date.now() + random number`) before saving, so the original filename (which cannot be trusted) is never used directly for storage.
5. The file is saved to the local `uploads/` folder, and its relative path (e.g. `/uploads/12345-6789.png`) is stored on the Task document in MongoDB.
6. The file is served back to the frontend through a static route (`app.use('/uploads', express.static('uploads'))`), so it can be viewed directly in the browser via a link.

### Example Request (multipart/form-data)
POST /api/tasks
- title: "Grocery Shopping"
- description: "Buy milk and eggs"
- attachment: (file)

## Week 4 Feature: Pagination, Filtering & Search

All three work together on the same endpoint: `GET /api/tasks`

| Query Parameter | Purpose | Example |
|---|---|---|
| `page` | Which page of results to return (default: 1) | `?page=2` |
| `limit` | How many results per page (default: 5) | `?limit=10` |
| `completed` | Filter by completion status (`true` or `false`) | `?completed=true` |
| `search` | Partial, case-insensitive match on task title | `?search=grocery` |

### Combined Example
GET /api/tasks?page=1&limit=5&completed=false&search=shopping
This returns page 1, 5 results per page, only incomplete tasks, whose title contains "shopping" (case-insensitive).

### Response Shape
```json
{
  "tasks": [ ... ],
  "currentPage": 1,
  "totalPages": 3,
  "totalTasks": 12
}
```

The query respects the same ownership rule from Week 3 - a user only ever sees their own tasks, regardless of the filters applied.

## Authentication Flow
1. **Register:** The user submits name, email, and password. The password is hashed using bcrypt before being saved to the database.
2. **Login:** The user submits email and password. If the credentials are valid, a JWT token is generated and returned along with basic user info.
3. **Token Storage:** The frontend stores the token in `localStorage` after a successful login.
4. **Protected Requests:** For every task-related request, the token is sent in the `Authorization` header as `Bearer <token>`.
5. **Middleware Verification:** The backend middleware verifies the token before allowing access to protected routes. If the token is missing or invalid, a `401 Unauthorized` response is returned.
6. **Ownership Check:** For update/delete operations, the backend checks whether the logged-in user owns the task. If not, a `403 Forbidden` response is returned.
7. **Logout:** Clears the token from `localStorage` and redirects to the login page.

## Protected Endpoints

| Method | Endpoint            | Protected | Ownership Check | Notes |
|--------|----------------------|-----------|------------------|-------|
| POST   | /api/auth/register   | No        | -                | |
| POST   | /api/auth/login      | No        | -                | Rate limited (5/15min) |
| POST   | /api/tasks           | Yes       | -                | Accepts multipart/form-data with optional file |
| GET    | /api/tasks           | Yes       | Returns only own tasks | Supports page, limit, completed, search |
| GET    | /api/tasks/all       | Yes       | Admin only       | Bonus feature from Week 3 |
| PUT    | /api/tasks/:id       | Yes       | Yes              | |
| DELETE | /api/tasks/:id       | Yes       | Yes              | |

## Features Implemented (Week 3 + Week 4)
- User registration with hashed passwords (bcrypt)
- Login with JWT token generation
- Auth middleware protecting all task routes
- Ownership-based authorization on update/delete
- File upload with type and size validation (Multer)
- Uploaded files stored on disk and referenced on the task record
- Uploaded files served back to the frontend via a static route
- Offset/limit pagination on the task list endpoint
- Filtering by completion status
- Case-insensitive partial search by title
- Frontend upload form, search box, filter dropdown, and pagination controls
- 401 (not logged in) and 403 (not permitted) handled separately in the UI
- Logout functionality that clears the token

## Testing Notes
- Tested file upload with valid image (PNG) - accepted and stored correctly.
- Tested that the uploaded file is viewable directly via its `/uploads/...` URL in the browser.
- Tested pagination, filter, and search independently and combined via Postman and the frontend UI.
- Tested with two separate user accounts to confirm that one user cannot update or delete another user's tasks (returns 403 Forbidden).
- Tested that requests without a token are rejected with 401 Unauthorized.

## Author
Faizan Asif

## Bonus Features Implemented
- **Refresh Tokens:** Login now returns both an access token (15 min expiry) and a refresh token (7 day expiry). Use `POST /api/auth/refresh-token` with the refresh token to get a new access token without logging in again.
- **Role-Based Access:** Users have a `role` field (`user` or `admin`, default `user`). Admins can view all users tasks via `GET /api/tasks/all` (regular users get 403 Forbidden on this route).
- **Mock Password-Reset Flow:** `POST /api/auth/forgot-password` generates a reset token (returned directly in the response instead of being emailed, since this is a mock flow). `POST /api/auth/reset-password` accepts that token plus a new password to reset it.
- **Rate Limiting on Login:** `POST /api/auth/login` is limited to 5 attempts per 15 minutes per IP address using `express-rate-limit`, to slow down brute-force login attempts.