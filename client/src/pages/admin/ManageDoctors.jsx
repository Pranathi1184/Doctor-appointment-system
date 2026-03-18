import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Card from "../../components/Card";
import DataTable from "../../components/DataTable";
import LoadingSpinner from "../../components/LoadingSpinner";
import api from "../../services/api";
import Modal from "../../components/Modal";
import { IconEdit, IconUsers } from "../../components/Icons";

export default function ManageDoctors() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [editDoctor, setEditDoctor] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    experience: "",
    availableSlots: ""
  });

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/doctors");
      setDoctors(data.doctors || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.specialization || !form.experience) {
      toast.error("Please fill all required fields.");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        specialization: form.specialization,
        experience: Number(form.experience),
        availableSlots: form.availableSlots
          ? form.availableSlots.split(",").map((s) => s.trim()).filter(Boolean)
          : []
      };
      await api.post("/admin/doctors", payload);
      toast.success("Doctor created.");
      setForm({ name: "", email: "", password: "", specialization: "", experience: "", availableSlots: "" });
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create doctor");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (d) => {
    setEditDoctor({
      _id: d._id,
      name: d.userId?.name || "",
      email: d.userId?.email || "",
      specialization: d.specialization || "",
      experience: d.experience ?? "",
      availableSlots: (d.availableSlots || []).join(", ")
    });
  };

  const saveEdit = async () => {
    if (!editDoctor) return;
    if (!editDoctor.name || !editDoctor.email || !editDoctor.specialization || editDoctor.experience === "") {
      toast.error("Please fill all required fields.");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name: editDoctor.name,
        email: editDoctor.email,
        specialization: editDoctor.specialization,
        experience: Number(editDoctor.experience),
        availableSlots: editDoctor.availableSlots
          ? editDoctor.availableSlots.split(",").map((s) => s.trim()).filter(Boolean)
          : []
      };
      await api.put(`/admin/doctors/${editDoctor._id}`, payload);
      toast.success("Doctor updated.");
      setEditDoctor(null);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update doctor");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "name", header: "Name", render: (r) => r.userId?.name || "-" },
    { key: "email", header: "Email", render: (r) => r.userId?.email || "-" },
    { key: "specialization", header: "Specialization" },
    { key: "experience", header: "Experience (yrs)", render: (r) => r.experience },
    {
      key: "slots",
      header: "Slots",
      render: (r) => (r.availableSlots || []).slice(0, 2).join(" · ") || "-"
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-end",
      render: (r) => (
        <button
          className="btn btn-outline-primary btn-sm"
          data-bs-toggle="modal"
          data-bs-target="#editDoctorModal"
          onClick={() => openEdit(r)}
          disabled={saving}
        >
          <span className="d-inline-flex align-items-center gap-1">
            <IconEdit size={16} /> Edit
          </span>
        </button>
      )
    }
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="row g-3">
      <div className="col-lg-7">
        <Card
          title="Doctors"
          subtitle="All registered doctors"
          right={
            <span className="badge text-bg-light border d-inline-flex align-items-center gap-1">
              <IconUsers size={16} /> {doctors.length}
            </span>
          }
        >
          <DataTable columns={columns} rows={doctors.map((d) => ({ ...d, id: d._id }))} />
        </Card>
      </div>
      <div className="col-lg-5">
        <Card title="Add doctor" subtitle="Create a doctor login + profile">
          <form onSubmit={onSubmit}>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Name <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    disabled={saving}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">
                    Experience (years) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.experience}
                    onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">
                Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                className="form-control"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                disabled={saving}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                Password <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                className="form-control"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                disabled={saving}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                Specialization <span className="text-danger">*</span>
              </label>
              <input
                className="form-control"
                value={form.specialization}
                onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))}
                disabled={saving}
                placeholder="e.g. Cardiologist"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Available slots (comma-separated)</label>
              <input
                className="form-control"
                value={form.availableSlots}
                onChange={(e) => setForm((f) => ({ ...f, availableSlots: e.target.value }))}
                disabled={saving}
                placeholder="Mon 10:00-12:00, Wed 14:00-16:00"
              />
            </div>
            <button className="btn btn-primary w-100" disabled={saving} type="submit">
              {saving ? "Creating..." : "Create Doctor"}
            </button>
          </form>
        </Card>
      </div>

      <Modal
        id="editDoctorModal"
        title="Edit doctor"
        footer={
          <>
            <button type="button" className="btn btn-light" data-bs-dismiss="modal" disabled={saving}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={saveEdit} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </>
        }
      >
        {!editDoctor ? (
          <div className="text-muted">Select a doctor to edit.</div>
        ) : (
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Name</label>
              <input
                className="form-control"
                value={editDoctor.name}
                onChange={(e) => setEditDoctor((d) => ({ ...d, name: e.target.value }))}
                disabled={saving}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={editDoctor.email}
                onChange={(e) => setEditDoctor((d) => ({ ...d, email: e.target.value }))}
                disabled={saving}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Specialization</label>
              <input
                className="form-control"
                value={editDoctor.specialization}
                onChange={(e) => setEditDoctor((d) => ({ ...d, specialization: e.target.value }))}
                disabled={saving}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Experience (years)</label>
              <input
                type="number"
                className="form-control"
                value={editDoctor.experience}
                onChange={(e) => setEditDoctor((d) => ({ ...d, experience: e.target.value }))}
                disabled={saving}
              />
            </div>
            <div className="col-12">
              <label className="form-label">Available slots (comma-separated)</label>
              <input
                className="form-control"
                value={editDoctor.availableSlots}
                onChange={(e) => setEditDoctor((d) => ({ ...d, availableSlots: e.target.value }))}
                disabled={saving}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

