# Week 3 - Authentication, Authorization & Protected APIs

## Project Description
This project extends the Week 2 CRUD application by adding user
authentication (register/login) and ownership-based authorization.
Users can now create an account and log in, and each user can only
update or delete the tasks they personally created.

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Atlas)
- **Authentication:** JWT (jsonwebtoken), bcryptjs (password hashing)
- **Frontend:** HTML, CSS, JavaScript (Vanilla)

## Folder Structure


asl-week3-project/
- server/
  - models/
    - User.js (User schema - name, email, hashed password)
    - Task.js (Task schema - title, description, owner)
  - routes/
    - authRoutes.js (Register & Login endpoints)
    - taskRoutes.js (Protected CRUD endpoints)
  - middleware/
    - authMiddleware.js (JWT verification middleware)
  - server.js (Main entry point)
  - .env (Environment variables - not committed)
- client/
  - register.html (Registration form)
  - login.html (Login form)
  - dashboard.html (Task management dashboard)
- README.md

## Setup Instructions

### Backend Setup
1. Navigate to the server folder: `cd server`
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   - MONGODB_URI=your_mongodb_connection_string
   - JWT_SECRET=your_secret_key
   - PORT=5000
4. Start the server: `node server.js`

### Frontend Setup
1. Navigate to the client folder
2. Open `register.html` in a browser to create an account
3. Log in via `login.html`
4. You will be redirected to `dashboard.html` to manage tasks

## Authentication Flow
1. **Register:** The user submits name, email, and password. The password is hashed using bcrypt before being saved to the database.
2. **Login:** The user submits email and password. If the credentials are valid, a JWT token is generated and returned along with basic user info.
3. **Token Storage:** The frontend stores the token in `localStorage` after a successful login.
4. **Protected Requests:** For every task-related request, the token is sent in the `Authorization` header as `Bearer <token>`.
5. **Middleware Verification:** The backend middleware verifies the token before allowing access to protected routes. If the token is missing or invalid, a `401 Unauthorized` response is returned.
6. **Ownership Check:** For update/delete operations, the backend checks whether the logged-in user owns the task. If not, a `403 Forbidden` response is returned.
7. **Logout:** Clears the token from `localStorage` and redirects to the login page.

## Protected Endpoints

| Method | Endpoint           | Protected | Ownership Check |
|--------|--------------------|-----------| -----------------|
| POST   | /api/auth/register | No        | -                |
| POST   | /api/auth/login    | No        | -                |
| POST   | /api/tasks         | Yes       | -                |
| GET    | /api/tasks         | Yes       | Returns only own tasks |
| PUT    | /api/tasks/:id     | Yes       | Yes              |
| DELETE | /api/tasks/:id     | Yes       | Yes              |

## Features Implemented
- User registration with hashed passwords (bcrypt)
- Login with JWT token generation
- Auth middleware protecting all task routes
- Ownership-based authorization on update/delete
- Frontend forms for register/login
- Token storage and attachment on the frontend
- 401 (not logged in) and 403 (not permitted) handled separately in the UI
- Logout functionality that clears the token

## Testing Notes
- Tested with two separate user accounts to confirm that one user cannot update or delete another user's tasks (returns 403 Forbidden).
- Tested that requests without a token are rejected with 401 Unauthorized.

## Author
Faizan Asif
## Bonus Features Implemented
- **Refresh Tokens:** Login now returns both an access token (15 min expiry) and a refresh token (7 day expiry). Use `POST /api/auth/refresh-token` with the refresh token to get a new access token without logging in again.
- **Role-Based Access:** Users have a `role` field (`user` or `admin`, default `user`). Admins can view all users' tasks via `GET /api/tasks/all` (regular users get 403 Forbidden on this route).
- **Mock Password-Reset Flow:** `POST /api/auth/forgot-password` generates a reset token (returned directly in the response instead of being emailed, since this is a mock flow). `POST /api/auth/reset-password` accepts that token plus a new password to reset it.
- **Rate Limiting on Login:** `POST /api/auth/login` is limited to 5 attempts per 15 minutes per IP address using `express-rate-limit`, to slow down brute-force login attempts.