import React from "react";

export default function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  error,
  disabled
}) {
  return (
    <div className="mb-3">
      <label className="form-label">
        {label} {required ? <span className="text-danger">*</span> : null}
      </label>
      <input
        className={`form-control ${error ? "is-invalid" : ""}`}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
      {error ? <div className="invalid-feedback">{error}</div> : null}
    </div>
  );
}

