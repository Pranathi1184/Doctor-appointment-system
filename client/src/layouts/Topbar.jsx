import React from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../services/auth";

export default function Topbar() {
  const user = getUser();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom">
      <div className="container-fluid">
        <button
          className="btn btn-outline-secondary d-lg-none"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#sidebarOffcanvas"
          aria-controls="sidebarOffcanvas"
        >
          Menu
        </button>
        <span className="navbar-brand fw-semibold ms-2">Doctor Appointment System</span>
        <div className="ms-auto d-flex align-items-center gap-2">
          <span className="badge text-bg-light border">
            {user?.name} ({user?.role})
          </span>
          <button className="btn btn-outline-danger btn-sm" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

