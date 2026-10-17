# Mini ATS — Applicant Tracking System

A full-stack applicant tracking system built with React, Node.js, Express, and MongoDB.

---

## Features

- **Dashboard** — live metrics, candidates-by-stage bar chart, top jobs, recent candidates table
- **Candidates** — searchable/filterable table with add, edit, view, delete; skill tags; pagination
- **Candidate Detail** — full profile, pipeline progress bar, inline stage change
- **Hiring Pipeline** — Kanban-style board across 6 stages with optimistic stage updates
- **Jobs** — create, edit, delete job postings; applicant count per job; link to filtered candidates
- Responsive layout with fixed sidebar navigation
- Toast notifications, loading states, empty states, confirmation dialogs
- RESTful API with search, filter, sort, pagination, and MongoDB aggregation

---

## Technology Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 19, Vite 8, Tailwind CSS v4, React Router DOM v7 |
| Charts    | Recharts                                        |
| Icons     | Lucide React                                    |
| HTTP      | Axios                                           |
| Backend   | Node.js, Express 4                              |
| Database  | MongoDB with Mongoose 8                         |
| Dev       | Nodemon                                         |

---

## Prerequisites

- **Node.js** v18 or higher — https://nodejs.org
- **MongoDB** running locally on the default port (27017)
  - Install: https://www.mongodb.com/try/download/community
  - Or use MongoDB Atlas (free cloud tier): https://www.mongodb.com/atlas

---

## Project Structure

```
mini-ats/
├── client/                        # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── candidates/        # CandidateForm
│   │   │   ├── jobs/              # JobForm
│   │   │   ├── ui/                # Badge, Button, Card, Modal, Toast, …
│   │   │   ├── Sidebar.jsx
│   │   │   └── TopNav.jsx
│   │   ├── hooks/
│   │   │   └── useToast.js
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Candidates.jsx
│   │   │   ├── CandidateDetail.jsx
│   │   │   ├── Pipeline.jsx
│   │   │   └── Jobs.jsx
│   │   ├── services/
│   │   │   ├── api.js             # Axios instance
│   │   │   ├── candidateService.js
│   │   │   ├── jobService.js
│   │   │   └── dashboardService.js
│   │   ├── utils/
│   │   │   └── constants.js       # STAGES, colors, formatDate
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                        # Express backend
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── candidateController.js
│   │   ├── jobController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── validateObjectId.js
│   ├── models/
│   │   ├── Candidate.js
│   │   └── Job.js
│   ├── routes/
│   │   ├── candidates.js
│   │   ├── jobs.js
│   │   └── dashboard.js
│   ├── server.js
│   ├── seed.js                    # Sample data seeder
│   ├── .env                       # Local environment (not committed)
│   ├── .env.example               # Template
│   └── package.json
│
└── README.md
```

---

## Installation

### 1. Clone or open the project

```cmd
cd c:\Users\madhu\mini-ats
```

### 2. Install backend dependencies

```cmd
cd server
npm install
```

### 3. Install frontend dependencies

```cmd
cd ..\client
npm install
```

### 4. Configure environment

The server `.env` file is already created with defaults:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mini-ats
NODE_ENV=development
```

To use a different MongoDB URI (e.g. Atlas), edit `server/.env`:

```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/mini-ats
```

---

## Running the Application

Open **two separate terminal windows**.

### Terminal 1 — Backend

```cmd
cd c:\Users\madhu\mini-ats\server
npm run dev
```

Output:
```
Server running in development mode on port 5000
MongoDB Connected: localhost
```

### Terminal 2 — Frontend

```cmd
cd c:\Users\madhu\mini-ats\client
npm run dev
```

Output:
```
VITE ready in ~700ms
➜  Local: http://localhost:5173/
```

Then open **http://localhost:5173** in your browser.

> If port 5173 is in use, Vite will use 5174 automatically.

---

## Seed the Database

To populate the database with 7 sample jobs and 17 sample candidates:

```cmd
cd c:\Users\madhu\mini-ats\server
node seed.js
```

Output:
```
MongoDB connected for seeding...
Cleared existing data.
Inserted 7 jobs.
Inserted 17 candidates.
✅  Database seeded successfully!
MongoDB disconnected.
```

> **Warning:** The seed script clears all existing candidates and jobs before inserting.

---

## API Endpoints

Base URL: `http://localhost:5000`

### Dashboard
| Method | Endpoint                | Description          |
|--------|-------------------------|----------------------|
| GET    | /api/dashboard/stats    | Live metrics & stats |

### Candidates
| Method | Endpoint                        | Description                          |
|--------|---------------------------------|--------------------------------------|
| GET    | /api/candidates                 | List with search/filter/sort/paginate |
| GET    | /api/candidates/:id             | Single candidate                     |
| POST   | /api/candidates                 | Create candidate                     |
| PUT    | /api/candidates/:id             | Update candidate                     |
| PATCH  | /api/candidates/:id/stage       | Update stage only                    |
| DELETE | /api/candidates/:id             | Delete candidate                     |

**Query parameters for GET /api/candidates:**
- `search` — name or email substring
- `stage` — comma-separated stages (e.g. `Applied,Interview`)
- `job` — job ObjectId
- `skills` — comma-separated skills
- `sortBy` — `name`, `appliedAt`, `experience`, `createdAt`
- `sortOrder` — `asc` or `desc`
- `page` — page number (default: 1)
- `limit` — results per page (default: 20, max: 100)

### Jobs
| Method | Endpoint        | Description         |
|--------|-----------------|---------------------|
| GET    | /api/jobs       | List all jobs       |
| GET    | /api/jobs/:id   | Single job          |
| POST   | /api/jobs       | Create job          |
| PUT    | /api/jobs/:id   | Update job          |
| DELETE | /api/jobs/:id   | Delete job          |

**Query parameters for GET /api/jobs:**
- `status` — `Open` or `Closed`
- `search` — title, department, or location substring

### Health
| Method | Endpoint     | Description    |
|--------|--------------|----------------|
| GET    | /api/health  | Server status  |

---

## Hiring Stages

Candidates move through these stages in order:

```
Applied → Screening → Interview → Offer → Hired
                                        ↘ Rejected
```

---

## Local URLs

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:5173       |
| Backend  | http://localhost:5000       |
| API Base | http://localhost:5000/api   |

---

## Known Limitations

- No authentication or user management — single-recruiter mode
- No drag-and-drop on the pipeline board (stage changes via dropdown)
- Recharts v2 deprecation warning in console — functional but can be upgraded to v3
- No file upload for resumes or attachments
- No email notifications

---

## Scripts Reference

| Directory | Command         | Description                    |
|-----------|-----------------|--------------------------------|
| server    | `npm run dev`   | Start with nodemon (hot reload) |
| server    | `npm start`     | Start without hot reload       |
| server    | `node seed.js`  | Seed the database              |
| client    | `npm run dev`   | Start Vite dev server          |
| client    | `npm run build` | Production build               |
| client    | `npm run preview` | Preview production build     |
