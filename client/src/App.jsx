import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import RoleRoute from "./components/RoleRoute";

import HomeRedirect from "./pages/HomeRedirect";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

import PatientDashboard from "./pages/patient/PatientDashboard";
import DoctorList from "./pages/patient/DoctorList";
import BookAppointment from "./pages/patient/BookAppointment";
import MyAppointments from "./pages/patient/MyAppointments";
import Prescriptions from "./pages/patient/Prescriptions";
import PatientProfile from "./pages/patient/PatientProfile";

import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorAppointments from "./pages/doctor/Appointments";
import DoctorBlocks from "./pages/doctor/DoctorBlocks";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageDoctors from "./pages/admin/ManageDoctors";
import ManageUsers from "./pages/admin/ManageUsers";
import ViewAppointments from "./pages/admin/ViewAppointments";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/landing" element={<Landing />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<RoleRoute roles={["patient", "doctor", "admin"]} />}>
          <Route element={<DashboardLayout />}>
            {/* Patient */}
            <Route element={<RoleRoute roles={["patient"]} />}>
              <Route path="/patient" element={<PatientDashboard />} />
              <Route path="/patient/doctors" element={<DoctorList />} />
              <Route path="/patient/book" element={<BookAppointment />} />
              <Route path="/patient/appointments" element={<MyAppointments />} />
              <Route path="/patient/prescriptions" element={<Prescriptions />} />
              <Route path="/patient/profile" element={<PatientProfile />} />
            </Route>

            {/* Doctor */}
            <Route element={<RoleRoute roles={["doctor"]} />}>
              <Route path="/doctor" element={<DoctorDashboard />} />
              <Route path="/doctor/appointments" element={<DoctorAppointments />} />
              <Route path="/doctor/blocks" element={<DoctorBlocks />} />
            </Route>

            {/* Admin */}
            <Route element={<RoleRoute roles={["admin"]} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/doctors" element={<ManageDoctors />} />
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/appointments" element={<ViewAppointments />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={2500} hideProgressBar newestOnTop />
    </>
  );
}

