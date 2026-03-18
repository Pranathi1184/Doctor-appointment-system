import React from "react";
import { Link } from "react-router-dom";
import hospitalArt from "../assets/hospital.svg";
import Card from "../components/Card";
import { IconCalendar, IconStethoscope, IconUsers } from "../components/Icons";

export default function Landing() {
  return (
    <div className="hospital-bg min-vh-100">
      <div className="container py-5">
        <div className="row align-items-center g-4">
          <div className="col-lg-6">
            <div className="badge rounded-pill text-bg-light border mb-3">Healthcare workflow demo</div>
            <h1 className="fw-bold display-6 text-hospital">Doctor Appointment & Consultation Management</h1>
            <p className="text-muted mt-3">
              A simple MERN system to book appointments, manage consultations, add prescriptions, and track follow-ups —
              with role-based dashboards for <b>Patients</b>, <b>Doctors</b>, and <b>Admins</b>.
            </p>
            <div className="d-flex gap-2 mt-4">
              <Link to="/login" className="btn btn-primary btn-lg">
                Login
              </Link>
              <Link to="/register" className="btn btn-outline-primary btn-lg">
                Register as Patient
              </Link>
            </div>
            <div className="small text-muted mt-3">
              Note: Doctors and Admins are created by an Admin inside the dashboard (recommended).
            </div>
          </div>
          <div className="col-lg-6">
            <img src={hospitalArt} className="img-fluid rounded-4 shadow" alt="Hospital theme" />
          </div>
        </div>

        <div className="row g-3 mt-4">
          <div className="col-md-4">
            <Card
              title={
                <span className="d-inline-flex align-items-center gap-2">
                  <IconUsers size={18} /> Role based
                </span>
              }
              subtitle="Admin / Doctor / Patient"
            >
              <div className="text-muted">
                Each role sees only what they need: admin management, doctor consultations, patient booking & history.
              </div>
            </Card>
          </div>
          <div className="col-md-4">
            <Card
              title={
                <span className="d-inline-flex align-items-center gap-2">
                  <IconCalendar size={18} /> Appointments
                </span>
              }
              subtitle="Book with available slots"
            >
              <div className="text-muted">
                Patients can book appointments only during a doctor’s available slots (validated on the server).
              </div>
            </Card>
          </div>
          <div className="col-md-4">
            <Card
              title={
                <span className="d-inline-flex align-items-center gap-2">
                  <IconStethoscope size={18} /> Consultations
                </span>
              }
              subtitle="Notes, prescriptions, follow-ups"
            >
              <div className="text-muted">
                Doctors add diagnosis/notes and prescriptions, and can recommend follow-up appointments.
              </div>
            </Card>
          </div>
        </div>

        <div className="text-center text-muted small mt-5">
          Built with React + Express + MongoDB. Clean, simple and beginner-friendly.
        </div>
      </div>
    </div>
  );
}

