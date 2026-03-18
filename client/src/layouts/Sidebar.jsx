import React from "react";
import { NavLink } from "react-router-dom";
import { getUser } from "../services/auth";
import { IconCalendar, IconUsers, IconStethoscope } from "../components/Icons";

function Item({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `list-group-item list-group-item-action border-0 rounded d-flex align-items-center gap-2 ${
          isActive ? "active" : ""
        }`
      }
      end
    >
      <span className="opacity-75">{icon || null}</span>
      {label}
    </NavLink>
  );
}

export default function Sidebar({ variant = "desktop" }) {
  const user = getUser();
  const role = user?.role;

  const patientItems = [
    { to: "/patient", label: "Dashboard", icon: <IconStethoscope size={16} /> },
    { to: "/patient/doctors", label: "Doctor List", icon: <IconUsers size={16} /> },
    { to: "/patient/book", label: "Book Appointment", icon: <IconCalendar size={16} /> },
    { to: "/patient/appointments", label: "My Appointments", icon: <IconCalendar size={16} /> },
    { to: "/patient/prescriptions", label: "Prescriptions & Follow-ups", icon: <IconStethoscope size={16} /> },
    { to: "/patient/profile", label: "My Profile", icon: <IconUsers size={16} /> }
  ];

  const doctorItems = [
    { to: "/doctor", label: "Dashboard", icon: <IconStethoscope size={16} /> },
    { to: "/doctor/appointments", label: "Appointments", icon: <IconCalendar size={16} /> },
    { to: "/doctor/blocks", label: "Leave / Block Days", icon: <IconCalendar size={16} /> }
  ];

  const adminItems = [
    { to: "/admin", label: "Dashboard", icon: <IconStethoscope size={16} /> },
    { to: "/admin/doctors", label: "Manage Doctors", icon: <IconUsers size={16} /> },
    { to: "/admin/users", label: "Manage Users", icon: <IconUsers size={16} /> },
    { to: "/admin/appointments", label: "View Appointments", icon: <IconCalendar size={16} /> }
  ];

  const items =
    role === "admin" ? adminItems : role === "doctor" ? doctorItems : role === "patient" ? patientItems : [];

  const content = (
    <div className="p-3">
      <div className="fw-semibold mb-2">Navigation</div>
      <div className="list-group list-group-flush">
        {items.map((i) => (
          <Item key={i.to} to={i.to} label={i.label} icon={i.icon} />
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
      <div className="border-bottom p-3 fw-bold text-hospital d-flex align-items-center gap-2">
        <IconStethoscope size={18} /> CarePoint
      </div>
      {content}
    </aside>
  );
}

