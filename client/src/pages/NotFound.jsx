import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container py-5">
      <div className="text-center">
        <h3 className="mb-2">Page not found</h3>
        <p className="text-muted">The page you are looking for doesn’t exist.</p>
        <Link className="btn btn-primary" to="/">
          Go Home
        </Link>
      </div>
    </div>
  );
}

