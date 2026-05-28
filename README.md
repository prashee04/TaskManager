# Task Manager Web App

## Project Overview

Task Manager is a full-stack web application designed to help teams and individuals organize workload, track ownership, and monitor delivery status. The application features a clean, responsive UI with real-time feedback, user authentication, role-based access control (Admin/Member), and a comprehensive dashboard with statistics and charts to keep track of tasks.

## Tech Stack

### Frontend

- **Framework:** React (Functional Components)
- **Routing:** React Router DOM
- **State Management:** React Context API (`AuthContext`)
- **Styling:** Tailwind CSS & Headless UI / Heroicons
- **HTTP Client:** Axios (with request/response interceptors)
- **Notifications:** React Hot Toast

### Backend

- **Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB via Mongoose
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs for password hashing

---

## Setup Steps

### Prerequisites

- Node.js (v16+)
- MongoDB running locally or a MongoDB Atlas connection string

### 1. Clone & Install Dependencies

Navigate to the project root and install both frontend and backend dependencies:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:3000
ADMIN_INVITE_CODE=your_secret_admin_code
```

Create a `.env` file in the `frontend` directory with the following variables:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

### 3. Run the Application

You will need two terminal tabs/windows to run both servers concurrently.

**Terminal 1 (Backend):**

```bash
cd backend
npm run dev # or node server.js
```

**Terminal 2 (Frontend):**

```bash
cd frontend
npm start
```

The application will be accessible at `http://localhost:3000`.

---

## Folder Structure

```text
taskManager_web_app/
├── backend/                  # Express.js Server
│   ├── config/               # Database connection logic
│   ├── controllers/          # Route handlers (auth, tasks, users)
│   ├── middleware/           # Auth, Error handling, Upload middlewares
│   ├── models/               # Mongoose schemas (Task, User)
│   ├── routes/               # Express routes
│   ├── utils/                # Helper functions (JWT, custom errors)
│   └── server.js             # Entry point
│
└── frontend/                 # React UI
    ├── public/               # Static assets
    └── src/
        ├── components/       # React components (auth, dashboard, tasks, common)
        ├── context/          # React Context (AuthContext)
        ├── services/         # Axios API abstraction
        ├── utils/            # Shared utilities (validations)
        ├── App.jsx           # Main routing component
        └── index.js          # React DOM entry
```

---

## API Endpoints

### Authentication & Profile (`/api/auth`)

| Method | Path        | Auth Req? | Description                | Sample Body                                                                                     |
| :----- | :---------- | :-------- | :------------------------- | :---------------------------------------------------------------------------------------------- |
| `POST` | `/register` | No        | Register a new user        | `{ "name": "John", "email": "j@test.com", "password": "123", "adminInvitation": "secretCode" }` |
| `POST` | `/login`    | No        | Authenticate user          | `{ "email": "j@test.com", "password": "123" }`                                                  |
| `GET`  | `/profile`  | Yes       | Get logged-in user profile | `N/A`                                                                                           |
| `PUT`  | `/profile`  | Yes       | Update profile             | `{ "name": "John Doe", "password": "new" }`                                                     |

### Tasks (`/api/tasks`)

| Method   | Path                   | Auth Req?   | Description                                        | Sample Body                                                            |
| :------- | :--------------------- | :---------- | :------------------------------------------------- | :--------------------------------------------------------------------- |
| `GET`    | `/`                    | Yes         | Get all tasks (Filters for members, all for Admin) | `N/A`                                                                  |
| `GET`    | `/:id`                 | Yes         | Get specific task by ID                            | `N/A`                                                                  |
| `POST`   | `/`                    | Yes (Admin) | Create a new task                                  | `{ "title": "Setup DB", "dueDate": "2026-10-10", "priority": "High" }` |
| `PUT`    | `/:id`                 | Yes         | Update task details                                | `{ "title": "Updated Title", "priority": "Low" }`                      |
| `DELETE` | `/:id`                 | Yes (Admin) | Delete a task                                      | `N/A`                                                                  |
| `PUT`    | `/:id/status`          | Yes         | Update task status                                 | `{ "status": "In Progress" }`                                          |
| `PUT`    | `/:id/todo`            | Yes         | Update checklist array                             | `{ "todoChecklist": [{ "text": "Step 1", "completed": true }] }`       |
| `GET`    | `/dashboard-data`      | Yes         | Admin global task statistics                       | `N/A`                                                                  |
| `GET`    | `/user-dashboard-data` | Yes         | User specific task statistics                      | `N/A`                                                                  |

### Users (`/api/users`)

| Method | Path   | Auth Req?   | Description             | Sample Body                                                     |
| :----- | :----- | :---------- | :---------------------- | :-------------------------------------------------------------- |
| `GET`  | `/`    | Yes (Admin) | List all users          | `N/A`                                                           |
| `POST` | `/`    | Yes (Admin) | Create a user           | `{ "name": "Alice", "email": "a@test.com", "password": "123" }` |
| `GET`  | `/:id` | Yes         | Get specific user by ID | `N/A`                                                           |

---

## Assumptions Made

1.  **Local Image Storage:** Uploaded files (like profile pictures) are assumed to be stored locally in the `backend/uploads` directory rather than an external cloud provider (like AWS S3 or Cloudinary) for simplicity.
2.  **Authentication Security:** JWT tokens are currently stored in `localStorage` on the frontend for ease of implementation. In a highly secure production environment, this would ideally be shifted to `httpOnly` cookies.
3.  **Admin Provisioning:** The role of 'Admin' is determined during registration if the user provides the correct `ADMIN_INVITE_CODE` matching the backend environment variable.
4.  **Database Seeding:** It is assumed the database starts empty and is populated through the application's UI (creating an admin user first using the invite code).
5.  **CORS:** The backend is configured to accept cross-origin requests specifically from `http://localhost:3000` or whatever is defined in the `CLIENT_URL` env variable.
