import React from "react";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="container py-5">
      <div className="text-center">
        <h3 className="mb-2">Unauthorized</h3>
        <p className="text-muted">You don’t have access to this page.</p>
        <Link className="btn btn-primary" to="/">
          Go Home
        </Link>
      </div>
    </div>
  );
}

