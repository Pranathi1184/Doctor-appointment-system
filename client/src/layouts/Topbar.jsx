import React from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../services/auth";
import { IconStethoscope } from "../components/Icons";

export default function Topbar() {
  const user = getUser();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg hospital-topbar border-bottom">
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
        <span className="navbar-brand fw-bold ms-2 d-flex align-items-center gap-2 text-white">
          <IconStethoscope size={18} />
          CarePoint Clinic
        </span>
        <div className="ms-auto d-flex align-items-center gap-2">
          <span className="badge text-bg-light border">
            {user?.name} ({user?.role})
          </span>
          <button className="btn btn-light btn-sm" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

