import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <Sidebar variant="offcanvas" />
      <div className="content">
        <Topbar />
        <main className="container-fluid py-4 dashboard-surface">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

