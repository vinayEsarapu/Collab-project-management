# Collaborative Project Management & Issue Tracking Platform

A full-stack MERN application for managing projects, team members, tasks, and issues in one place.

The application allows project owners and team members to create and manage projects, assign tasks and issues, discuss work through comments, and track important project activities.

This project was built to practice real-world MERN application development, including authentication, authorization, REST APIs, MongoDB, React, validation, error handling, and frontend-backend integration.

---

## Features

### Authentication & Account Management

- User registration and login
- JWT-based authentication
- Access token and refresh token flow
- HTTP-only refresh token cookie
- Protected routes
- Logout
- Get currently authenticated user
- Forgot password
- Reset password
- Change email with email verification
- Password hashing using bcrypt
- Request validation

### Project Management

- Create projects
- View projects
- Update projects
- Delete projects
- Project owner and member management
- Add and remove project members
- View project details
- Project-level comments
- Project activity tracking
- Delete project comments
- Delete project activity logs

### Task Management

- Create tasks inside projects
- View task details
- Update tasks
- Delete tasks
- Assign tasks to project members
- Change task status
- Set task priority
- Task-level comments
- Task-level activity tracking
- Task issue management
- Delete task comments and activity logs

### Issue Tracking

- Create project-level issues
- Create task-level issues
- Assign issues
- Refer issues to members
- Update issues
- Delete issues
- Issue status and priority management
- Issue comments
- Issue activity tracking
- Delete issue comments and activity logs

### Profile & Dashboard

- View user profile
- View projects associated with the user
- View assigned tasks
- View assigned issues
- View referred issues
- Filter project/task/issue information
- Pagination
- Navigate between related project, task, and issue pages

### UI & UX

- Responsive React interface
- Dark-themed UI
- Protected navigation
- Application-level confirmation dialogs
- Date-based filtering for comments and activity
- Loading and error states
- Reusable components

---

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- Tailwind CSS
- React Router
- Axios
- Lucide React

### Backend

- Node.js
- Express.js
- JWT
- bcrypt
- express-validator
- express-rate-limit
- cookie-parser
- CORS

### Database

- MongoDB Atlas
- Mongoose

### Tools

- Git
- GitHub
- VS Code
- Thunder Client / Postman

---

## Project Structure

```text
Collab-project-management/
│
├── Client/
│   ├── src/
│   │   ├── Components/
│   │   ├── Context/
│   │   ├── Pages/
│   │   ├── Services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── Server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
└── README.md