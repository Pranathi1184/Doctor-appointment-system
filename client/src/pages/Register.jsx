import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import { saveAuth } from "../services/auth";
import FormInput from "../components/FormInput";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "female",
    contact: ""
  });

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.email.trim()) next.email = "Email is required";
    if (!form.password || form.password.length < 6) next.password = "Min 6 characters";
    const ageNum = Number(form.age);
    if (!form.age || Number.isNaN(ageNum) || ageNum < 0) next.age = "Valid age is required";
    if (!form.contact.trim()) next.contact = "Contact is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const payload = { ...form, age: Number(form.age) };
      const { data } = await api.post("/auth/register", payload);
      saveAuth({ token: data.token, user: data.user });
      const me = await api.get("/auth/me");
      saveAuth({ token: data.token, user: data.user, profile: { patientId: me.data.patientId, doctorId: me.data.doctorId } });
      toast.success("Registration successful!");
      navigate("/patient");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <FormInput
        label="Full name"
        name="name"
        value={form.name}
        onChange={onChange}
        required
        error={errors.name}
        disabled={loading}
      />
      <FormInput
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={onChange}
        required
        error={errors.email}
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
        disabled={loading}
      />
      <div className="row">
        <div className="col-md-4">
          <FormInput
            label="Age"
            name="age"
            type="number"
            value={form.age}
            onChange={onChange}
            required
            error={errors.age}
            disabled={loading}
          />
        </div>
        <div className="col-md-8">
          <div className="mb-3">
            <label className="form-label">
              Gender <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              name="gender"
              value={form.gender}
              onChange={onChange}
              disabled={loading}
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>
      <FormInput
        label="Contact number"
        name="contact"
        value={form.contact}
        onChange={onChange}
        required
        error={errors.contact}
        disabled={loading}
        placeholder="e.g. 9999990001"
      />
      <button className="btn btn-primary w-100" type="submit" disabled={loading}>
        {loading ? "Creating account..." : "Register as Patient"}
      </button>
    </form>
  );
}

