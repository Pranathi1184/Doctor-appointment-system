import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Card from "../../components/Card";
import LoadingSpinner from "../../components/LoadingSpinner";
import api from "../../services/api";
import { IconUsers } from "../../components/Icons";

export default function PatientProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patient, setPatient] = useState(null);
  const [form, setForm] = useState({
    age: "",
    gender: "female",
    contact: "",
    bloodGroup: "",
    allergies: "",
    conditions: "",
    notes: ""
  });

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/patients/me");
      setPatient(data.patient);
      setForm({
        age: data.patient.age ?? "",
        gender: data.patient.gender ?? "female",
        contact: data.patient.contact ?? "",
        bloodGroup: data.patient.medicalDetails?.bloodGroup ?? "",
        allergies: data.patient.medicalDetails?.allergies ?? "",
        conditions: data.patient.medicalDetails?.conditions ?? "",
        notes: data.patient.medicalDetails?.notes ?? ""
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSave = async (e) => {
    e.preventDefault();
    if (!form.contact.trim()) return toast.error("Contact is required.");
    const ageNum = Number(form.age);
    if (Number.isNaN(ageNum) || ageNum < 0) return toast.error("Valid age is required.");

    try {
      setSaving(true);
      const payload = {
        age: ageNum,
        gender: form.gender,
        contact: form.contact,
        medicalDetails: {
          bloodGroup: form.bloodGroup,
          allergies: form.allergies,
          conditions: form.conditions,
          notes: form.notes
        }
      };
      const { data } = await api.put("/patients/me", payload);
      setPatient(data.patient);
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="row g-3">
      <div className="col-lg-8">
        <Card
          title={
            <span className="d-inline-flex align-items-center gap-2">
              <IconUsers size={18} /> My profile
            </span>
          }
          subtitle="Update your personal and medical details (visible to your doctor)"
        >
          <form onSubmit={onSave}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.age}
                  onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                  disabled={saving}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Gender</label>
                <select
                  className="form-select"
                  value={form.gender}
                  onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                  disabled={saving}
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Contact</label>
                <input
                  className="form-control"
                  value={form.contact}
                  onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))}
                  disabled={saving}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Blood group</label>
                <input
                  className="form-control"
                  value={form.bloodGroup}
                  onChange={(e) => setForm((f) => ({ ...f, bloodGroup: e.target.value }))}
                  disabled={saving}
                  placeholder="e.g. O+"
                />
              </div>
              <div className="col-md-8">
                <label className="form-label">Allergies</label>
                <input
                  className="form-control"
                  value={form.allergies}
                  onChange={(e) => setForm((f) => ({ ...f, allergies: e.target.value }))}
                  disabled={saving}
                  placeholder="e.g. Penicillin, pollen"
                />
              </div>
              <div className="col-12">
                <label className="form-label">Existing conditions</label>
                <input
                  className="form-control"
                  value={form.conditions}
                  onChange={(e) => setForm((f) => ({ ...f, conditions: e.target.value }))}
                  disabled={saving}
                  placeholder="e.g. Hypertension, diabetes"
                />
              </div>
              <div className="col-12">
                <label className="form-label">Medical notes</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  disabled={saving}
                  placeholder="Any details you want your doctor to know..."
                />
              </div>
            </div>
            <button className="btn btn-primary mt-3" disabled={saving} type="submit">
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </Card>
      </div>
      <div className="col-lg-4">
        <Card title="Account" subtitle="Linked login information" accent="blue">
          <div className="text-muted small">Name</div>
          <div className="fw-semibold">{patient?.userId?.name || "-"}</div>
          <div className="text-muted small mt-2">Email</div>
          <div className="fw-semibold">{patient?.userId?.email || "-"}</div>
        </Card>
      </div>
    </div>
  );
}

