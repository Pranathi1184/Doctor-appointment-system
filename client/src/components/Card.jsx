import React from "react";

export default function Card({ title, subtitle, right, children, className = "" }) {
  return (
    <div className={`card shadow-sm ${className}`}>
      {title || right ? (
        <div className="card-header bg-white d-flex align-items-center justify-content-between">
          <div>
            {title ? <div className="fw-semibold">{title}</div> : null}
            {subtitle ? <div className="text-muted small">{subtitle}</div> : null}
          </div>
          {right || null}
        </div>
      ) : null}
      <div className="card-body">{children}</div>
    </div>
  );
}

