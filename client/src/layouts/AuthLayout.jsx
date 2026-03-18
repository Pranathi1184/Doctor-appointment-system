import React from "react";
import { Outlet, Link } from "react-router-dom";
import hospitalArt from "../assets/hospital.svg";

export default function AuthLayout() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center hospital-bg p-3">
      <div className="card shadow-lg border-0" style={{ maxWidth: 900, width: "100%" }}>
        <div className="card-body p-4">
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <div className="mb-2 fw-bold fs-4 text-hospital">Doctor Appointment System</div>
              <div className="text-muted mb-4">Simple consultation & appointment management</div>
              <Outlet />
              <div className="mt-4 small text-muted">
                Demo accounts are available after seeding. See the root `README.md`.
                <div className="mt-2">
                  <Link to="/login">Login</Link> · <Link to="/register">Register</Link>
                </div>
              </div>
            </div>
            <div className="col-lg-6 d-none d-lg-block">
              <img src={hospitalArt} alt="Hospital theme" className="img-fluid rounded-4 shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

