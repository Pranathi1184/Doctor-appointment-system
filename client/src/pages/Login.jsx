import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import { saveAuth } from "../services/auth";
import FormInput from "../components/FormInput";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Email is required";
    if (!form.password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const { data } = await api.post("/auth/login", form);
      saveAuth({ token: data.token, user: data.user });
      const me = await api.get("/auth/me");
      saveAuth({ token: data.token, user: data.user, profile: { patientId: me.data.patientId, doctorId: me.data.doctorId } });
      toast.success("Welcome back!");

      const role = data.user.role;
      navigate(role === "admin" ? "/admin" : role === "doctor" ? "/doctor" : "/patient");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <FormInput
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={onChange}
        required
        error={errors.email}
        placeholder="you@example.com"
        disabled={loading}
      />
      <FormInput
        label="Password"
        name="password"
        type="password"
        value={form.password}
        onChange={onChange}
        required
        error={errors.password}
        placeholder="Your password"
        disabled={loading}
      />
      <button className="btn btn-primary w-100" type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Login"}
      </button>
      <div className="alert alert-light border mt-3 small mb-0">
        <div className="fw-semibold mb-1">Seeded demo credentials</div>
        <div>Admin: admin@demo.com / Admin@123</div>
        <div>Doctor: asha.rao@demo.com / Doctor@123</div>
        <div>Patient: ananya@demo.com / Patient@123</div>
      </div>
    </form>
  );
}

