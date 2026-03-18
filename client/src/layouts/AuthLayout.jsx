import React from "react";
import { Outlet, Link } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-3">
      <div className="card shadow-sm" style={{ maxWidth: 520, width: "100%" }}>
        <div className="card-body p-4">
          <div className="mb-2 fw-semibold fs-4">Doctor Appointment System</div>
          <div className="text-muted mb-4">Simple consultation & appointment management</div>
          <Outlet />
          <div className="mt-4 small text-muted">
            Demo accounts are available after seeding. See the root `README.md`.
            <div className="mt-2">
              <Link to="/login">Login</Link> · <Link to="/register">Register</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

