# Doctor Appointment & Consultation Management System

A MERN stack web application for managing doctor appointments, consultations, prescriptions, and follow-up recommendations.

---

## Description

This system allows patients to search for doctors, book appointments, and access consultation details. Doctors can manage appointments, add consultation notes, issue prescriptions, and recommend follow-ups. Admins manage users and monitor the system.

---

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Password hashing using bcrypt
- Role-based access control

### Patient
- Search and filter doctors
- Book appointments
- View appointment history
- View consultation notes
- View prescriptions
- View follow-up recommendations

### Doctor
- View appointments
- Add consultation notes
- Create prescriptions
- Recommend follow-ups
- Manage availability slots

### Admin
- Manage doctors
- Manage users
- View all appointments

---

## Tech Stack

### Frontend
- React.js
- Bootstrap
- React Router
- Axios
- React Toastify

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

---

## Project Structure

### Client

client/
  src/
    components/
    pages/
    layouts/
    services/

### Server

server/
  config/
  models/
  controllers/
  routes/
  middleware/
  seed/

---

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB

### Clone Repository
git clone https://github.com/Pranathi1184/Doctor-appointment-system.git  
cd Doctor-appointment-system  

### Install Dependencies
npm install  
npm run install:all  

### Environment Variables

Create `.env` in server:

PORT=5001  
MONGO_URI=mongodb://127.0.0.1:27017/doctor_appointments  
JWT_SECRET=your_secret_key_here  
JWT_EXPIRE=7d  
CLIENT_URL=http://localhost:3001  

Create `.env` in client:

VITE_API_URL=http://localhost:5001/api  

### Seed Database
npm run seed  

### Run Application
npm run dev  

Frontend: http://localhost:3001  
Backend: http://localhost:5001  

---

## API Endpoints

### Auth
POST /api/auth/register  
POST /api/auth/login  
GET /api/auth/me  

### Doctors
GET /api/doctors  
GET /api/doctors/:id  

### Appointments
POST /api/appointments  
GET /api/appointments/patient  
GET /api/appointments/doctor  

### Notes
POST /api/notes  
GET /api/notes/:appointmentId  

### Prescriptions
POST /api/prescriptions  
GET /api/prescriptions/:patientId  

### Follow-ups
POST /api/followups  
GET /api/followups/:patientId  

---

## Demo Credentials

Admin  
Email: admin@demo.com  
Password: Admin@123  

Doctor  
Email: doctor1@demo.com  
Password: Doctor@123  

Patient  
Email: patient1@demo.com  
Password: Patient@123  

---

## Database Collections

- Users  
- Doctors  
- Patients  
- Appointments  
- ConsultationNotes  
- Prescriptions  
- FollowUps  

---

## Features Implemented

- Authentication with JWT  
- Role-based access control  
- Appointment booking system  
- Consultation notes and prescriptions  
- Follow-up recommendations  
- Admin management system  
- Responsive UI  

---

## Future Improvements

- Video consultation  
- Notifications (Email/SMS)  
- Payment integration  
- Medical history tracking  

---

## Author

Pranathi  
GitHub: https://github.com/Pranathi1184  

---
