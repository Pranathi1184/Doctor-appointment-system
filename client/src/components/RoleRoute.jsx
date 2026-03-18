import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getUser, isLoggedIn } from "../services/auth";

export default function RoleRoute({ roles }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  const user = getUser();
  if (!user || (roles && !roles.includes(user.role))) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}

