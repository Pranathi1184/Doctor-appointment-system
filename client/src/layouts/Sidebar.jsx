import React from "react";
import { NavLink } from "react-router-dom";
import { getUser } from "../services/auth";

function Item({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `list-group-item list-group-item-action border-0 rounded ${isActive ? "active" : ""}`
      }
      end
    >
      {label}
    </NavLink>
  );
}

export default function Sidebar({ variant = "desktop" }) {
  const user = getUser();
  const role = user?.role;

  const patientItems = [
    { to: "/patient", label: "Dashboard" },
    { to: "/patient/doctors", label: "Doctor List" },
    { to: "/patient/book", label: "Book Appointment" },
    { to: "/patient/appointments", label: "My Appointments" },
    { to: "/patient/prescriptions", label: "Prescriptions & Follow-ups" }
  ];

  const doctorItems = [
    { to: "/doctor", label: "Dashboard" },
    { to: "/doctor/appointments", label: "Appointments" }
  ];

  const adminItems = [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/doctors", label: "Manage Doctors" },
    { to: "/admin/users", label: "Manage Users" },
    { to: "/admin/appointments", label: "View Appointments" }
  ];

  const items =
    role === "admin" ? adminItems : role === "doctor" ? doctorItems : role === "patient" ? patientItems : [];

  const content = (
    <div className="p-3">
      <div className="fw-semibold mb-2">Navigation</div>
      <div className="list-group list-group-flush">
        {items.map((i) => (
          <Item key={i.to} to={i.to} label={i.label} />
        ))}
      </div>
    </div>
  );

  if (variant === "offcanvas") {
    return (
      <div className="offcanvas offcanvas-start" tabIndex="-1" id="sidebarOffcanvas">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Menu</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
        </div>
        <div className="offcanvas-body p-0">{content}</div>
      </div>
    );
  }

  return (
    <aside className="sidebar d-none d-lg-block bg-white border-end position-fixed top-0 bottom-0">
      <div className="border-bottom p-3 fw-semibold">Doctor Appointment System</div>
      {content}
    </aside>
  );
}

