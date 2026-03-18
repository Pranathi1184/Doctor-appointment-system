import React from "react";
import { Navigate } from "react-router-dom";
import { getUser, isLoggedIn } from "../services/auth";

export default function HomeRedirect() {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  const role = getUser()?.role;
  if (role === "admin") return <Navigate to="/admin" replace />;
  if (role === "doctor") return <Navigate to="/doctor" replace />;
  return <Navigate to="/patient" replace />;
}

