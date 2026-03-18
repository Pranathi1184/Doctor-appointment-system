# Doctor Appointment & Consultation Management System (MERN)

Simple, production-ready MERN project with **Admin / Doctor / Patient** roles.

## Features

- **Auth**: JWT login/register, bcrypt password hashing
- **Patient**: search doctors, book appointments, view appointments, consultation notes, prescriptions, follow-ups
- **Doctor**: view appointments, add consultation notes (diagnosis), add prescriptions, add follow-ups
- **Admin**: manage doctors/users, view all appointments
- **UI**: Bootstrap dashboard layout, sidebar, tables, forms, toast notifications

## Folder structure

```
project/
  server/
    config/
    controllers/
    middleware/
    models/
    routes/
    seed/
    server.js
  client/
    src/
      components/
      layouts/
      pages/
      services/
      App.jsx
      main.jsx
```

## Environment variables

### Backend (`server/.env`)

Create `server/.env` from `server/.env.example`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/doctor_appointments
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:3000
```

### Frontend (`client/.env`)

Create `client/.env` from `client/.env.example`:

```
VITE_API_URL=http://localhost:5000/api
```

## Install & run locally

From the project root:

```bash
npm install
npm run install:all
```

1) Seed the database (adds **1 admin, 3 doctors, 5 patients + sample appointments/notes/prescriptions/followups**):

```bash
npm run seed
```

2) Start both backend + frontend:

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend health check: `http://localhost:5000/api/health`

## Seeded demo credentials

- **Admin**: `admin@demo.com` / `Admin@123`
- **Doctor**: `asha.rao@demo.com` / `Doctor@123`
- **Patient**: `ananya@demo.com` / `Patient@123`

## API endpoints (core)

- **Auth**
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- **Doctors**
  - `GET /api/doctors`
  - `GET /api/doctors/:id`
- **Appointments**
  - `POST /api/appointments`
  - `GET /api/appointments/patient`
  - `GET /api/appointments/doctor`
- **Notes**
  - `POST /api/notes`
  - `GET /api/notes/:appointmentId`
- **Prescriptions**
  - `POST /api/prescriptions`
  - `GET /api/prescriptions/:patientId`
- **FollowUps**
  - `POST /api/followups`
  - `GET /api/followups/:patientId`

Additional helper:
- `GET /api/auth/me` (returns profile ids for the logged-in user)
- Admin:
  - `GET /api/admin/users`
  - `DELETE /api/admin/users/:id`
  - `GET /api/admin/doctors`
  - `POST /api/admin/doctors`
  - `GET /api/admin/appointments`





