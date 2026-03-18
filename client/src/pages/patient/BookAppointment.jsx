import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Card from "../../components/Card";
import LoadingSpinner from "../../components/LoadingSpinner";
import api from "../../services/api";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function BookAppointment() {
  const navigate = useNavigate();
  const query = useQuery();
  const preDoctorId = query.get("doctorId") || "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ doctorId: preDoctorId, date: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/doctors");
        if (!mounted) return;
        setDoctors(data.doctors || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load doctors");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const validate = () => {
    const next = {};
    if (!form.doctorId) next.doctorId = "Please select a doctor";
    if (!form.date) next.date = "Please pick a date/time";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      await api.post("/appointments", { doctorId: form.doctorId, date: form.date });
      toast.success("Appointment booked!");
      navigate("/patient/appointments");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Booking failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="row g-3">
      <div className="col-lg-8">
        <Card title="Book appointment" subtitle="Choose doctor and time slot">
          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="form-label">
                Doctor <span className="text-danger">*</span>
              </label>
              <select
                className={`form-select ${errors.doctorId ? "is-invalid" : ""}`}
                value={form.doctorId}
                onChange={(e) => setForm((f) => ({ ...f, doctorId: e.target.value }))}
                disabled={saving}
              >
                <option value="">Select a doctor...</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.userId?.name} — {d.specialization}
                  </option>
                ))}
              </select>
              {errors.doctorId ? <div className="invalid-feedback">{errors.doctorId}</div> : null}
            </div>

            <div className="mb-3">
              <label className="form-label">
                Appointment date/time <span className="text-danger">*</span>
              </label>
              <input
                type="datetime-local"
                className={`form-control ${errors.date ? "is-invalid" : ""}`}
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                disabled={saving}
              />
              {errors.date ? <div className="invalid-feedback">{errors.date}</div> : null}
            </div>

            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Booking..." : "Book"}
            </button>
          </form>
        </Card>
      </div>

      <div className="col-lg-4">
        <Card title="Tip" subtitle="Use seeded data">
          <div className="text-muted small">
            If you ran the seed script, try booking with any doctor from the list. Doctors can then add notes,
            prescriptions, and follow-ups.
          </div>
        </Card>
      </div>
    </div>
  );
}

