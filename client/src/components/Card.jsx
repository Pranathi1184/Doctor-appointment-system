import React from "react";

export default function Card({ title, subtitle, right, children, className = "", accent = "teal" }) {
  const accentClass = accent === "blue" ? "hospital-card-accent-blue" : "hospital-card-accent-teal";
  return (
    <div className={`card shadow-sm border-0 ${className}`}>
      {title || right ? (
        <div className={`card-header bg-white d-flex align-items-center justify-content-between ${accentClass}`}>
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

